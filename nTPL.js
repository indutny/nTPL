/**
*	Usage:
*		require("./nTPL");
*		nTPL({
*			template: filename or inline template (@string),
*			name: template name (template will be accessible with this name) (@string),
*			args: arguments list (@array),
*			watch: Should reload template if file changed (@boolean),
*			callback: If callback provided - all things will be done in async mode,
					  and callback will be fired (@function(template function) )
*		});
*
*		nTPL(...) will generate(or return previously generated) template function,
*		that returns string value
*
*		Also nTPL.modificators are available
*		See nTPL.block and nTPL.filter for examples of usage
*/
this.nTPL = nTPL = (function($,undefined) {	
 
    (function (compile, $tab , gid ,
	           cache , refreshTemplate,
			   namecache , $brackets ,
			   $modificator , $tabs ,
			   $spaces , $decorator ,
			   modificators) {				
				
				var fs = require('fs');
				var path = require('path');
				
				/** @const */
				var REF_CHECK = {};
				
				/** @const */
				var WATCH = "w";

				/** @const */
				var NAME = "n";
				
				// Modificators
				modificators = {
				
					// Direct output
					// Can handle jQuery object!
					// Example: {%= "hello world" %}
					/** @return {string} */
					"="	:	preg_decorate("$p(%1,$_);"),
					
					// "if", "else", "elseif"
					// Example: {%if true%}I'm right!{%else%}I'm wrong{%/if%}
					// {%if false%}I'm wrong{%elseif true%}I'm true!{%/if%}
					/** @ret\urn {string} */
					"if": preg_decorate("if(%1){"),
					/** @return {string} */
					"else": return_decorate("}else{"),
					/** @return {string} */
					"elseif": preg_decorate("}else if(%1){"),
					/** @return {string} */
					
					"/if": return_decorate("}"),	
					
					// Short-hand for each method
					// Example: {%each arr%}<div>{%=this%}</div>{%/each%}
					/** @return {string} */
					"each": preg_decorate("nTPL.each(%1,function($i){"),
					/** @return {string} */
					"/each": return_decorate("});"),
					
					// Catch
					// Example: {%catch var a%}<div></div>{%/catch%}{%= a%}
					/** @return {string} */
					"catch" : preg_decorate("%1=(function(){var $_=[];"),
					/** @return {string} */
					"/catch" : return_decorate("return $_.join('')})();")
				};
				
		/**
		*	Generate function replacing pattern %1 in string
		*	@param {string} str string with pattern
		*	@return {function(string): string}
		*/
		function preg_decorate(str) {		
			/**
			* @param {string} s string to insert into str
			* @return {string}
			*/
			return function (s) {
				return str.replace($decorator , s , str);
			};
		}
		
		/**
		*	Generate function simply returning obj
		*	@param {string} obj object to return
		*	@return {function(): string}
		*/
		function return_decorate(obj) {
			/**
			* @return {string}
			*/
			return function() {
				return obj;
			}
		}
		/**
		* Watch file changes
		* And refresh template
		*
		*	@param {string} filename Filename
		*	@param {function(string,object): object} parse parse function
		*	@return {boolean}
		*/
		function watchChanges(filename, parse) {
			
			// Should be set watch flag in options
			if (!parse[WATCH])
				return;
				
			var name = parse[NAME], refreshFunc;
			
			// Template can be refreshed only if you have specified name
			if (name) {					
				
				fs.watchFile(filename, {persistent:true, interval: 100}, function() {
				
					fs.readFile(filename, function (err, data) {
						if (err)
							return;
						
						// Sometimes watchFile can be called before
						// template actually builds
						// check this out
						if (refreshFunc = refreshFunc || refreshTemplate[name]) {
							
							refreshFunc(parse.call(REF_CHECK, data.toString()));
						}
					});
					
				});
			}
		}
		/**
		* Check if templatename is filename
		* If so - load it
		* and watch changes of file
		*
		*	@param {string} filename Template name
		*	@param {function(string,object): object} parse parse function
		*	@param {function(string): boolean} callback Callback
		*	@return {string}
		*/
		function readTemplateAsync(filename, parse, callback) {
		
			// Check if file exists in async mode
			path.exists(filename, function(exists) {
				// If not - we've got not filename, but template
				// Fire callback
				if (!exists)
					return callback(filename);
				
				// Get file contents
				fs.readFile(filename, function (err, data) {
					// If can't - fire callback
					if (err)
						callback(filename);
					
					// Fire callback with file contents
					callback(data.toString());
				});
				
				// Watch for file changes
				watchChanges(filename, parse);
			});
			// No file - fire callback
			callback(filename);
		}
		/**
		* Check if templatename is filename
		* If so - load it
		* and watch changes of file
		*
		*	@param {string} filename Template name
		*	@param {function(string,object): object} parse parse function
		*	@return {string}
		*/
		function readTemplateSync(filename, parse) {
			// If there is no file
			// "filename" isn't really filename, but template
			// So return it
			if (!path.existsSync(filename))
				return filename;
				
			// Get template contents
			var template = fs.readFileSync(filename).toString();
			
			// Watch for file changes
			watchChanges(filename, parse);
						
			
			return template;
			
		}
		/**
		* Process input
		*   As object or as normal arguments
		*   Object must be 
		*
		*	@param {object} options Calling options
		*	@return {function(object): object}
		*/
		$ = function (options) {
			// If options isn't object - run function in "old" way
			if (typeof options !== "object")
				return $main.apply(this, arguments);
				
			// Cache for better compression
			var
				_template = options.template,
				_args = options.args,
				_name = options.name;
				
			// If we have only name - pass it as first arguments
			if (_name && !_template && !_args)
				return $main(_name);
			
			// If we at least have template - call normal
			if (_template)
				return $main(_template, _args || [], _name, options.callback, options.watch);
		}
		/**
		* Generate, cache, return template
		* $.template("name") - get cached template with name
		* $.template("%template%", {args}, [name]) - generate template and optionally give it a name
		* Args = Template arguments
		* @param {string} str Input template, or template name
		* @param {array} args Predefined arguments
		* @param {string} name Template name
		* @param {function(function(object): object): boolean} callback Callback for asynchronous mode
		* @param {boolean} watch Watch file changes or not?
		* @return {function(object): object}
		*/
		function $main(str , args, name, callback, watch) {
			// If have been cached by name
			// $.template("name")
			
			var $arguments = arguments, arglen = $arguments.length, 
				// Args converted to string
				// Need them for caching
				cache_name,
				// Index
				i;
			
			if (arglen == 1 && (i = namecache[str]))
				return i;
			
			// If have been cached template
			// $.template("%template%" , [ ["arg1", ... , "argN"] ], ["name"])
			if ( i = cache[cache_name = (str + $tab + args)] )
				return namecache[name] = i;
			
			// Store template name
			parse[NAME] = name;
			parse[WATCH] = watch;
			
			// If we don't have callback
			if (!callback) {			
				// Do all work in sync
				return parse(readTemplateSync(str, parse));
			} else {
				// Do all work in async
				readTemplateAsync(str, parse, function (data) {					
					parse(data, callback);
				});
			}
			/**
			* parseing input template with options
			* @param {string} str Input template
			* @param {object} options parseing options
			* @return {function(object): object}
			*/
			function parse(str, callback) {			
				
				var	compiled,
					namespace = {
						// Storage for replacements
						$r	:	[],
						// Global template Id, may be used by plugins
						$gid: gid++
					},
					local,
					// Index
					i,					
					// Var count
					varcount = 0,
					// Has code inside
					hasCode;
						
				// Add $_ to scope
				// And check that args is array
				( args instanceof Array) ? (args[ args.length ] = "$_") : (args = ["$_"]);
				
				// If template is not plain (with {% or %} inside) - generate function
				if (hasCode = str.match($brackets)) {
					// Preprocess template				
					// Go through each row
					// And replace it with code
					compiled = str ?
						str
							.replace($tabs , " ")
								.replace($brackets , $tab)
									.split($tab).map(
										function ( elem, i, varname) {
									
											if (i%2) {
												// Code
											
												// If there is modificator
												( (i = elem.match($modificator)) && ( i.f = modificators[ i[1] ]) ) &&
													// Use it to translate elem
													(
														elem = i.f(elem.substr(i[0].length), namespace)
													);
												
													return elem;
											}
											
											// Text
											if (!elem)
												return "";
																
											// Push text into namespace as $(var number)
											
											namespace[ args[args.length] = ("$" + varcount) ] = elem;
											
											// So, instead of inline printing we will print variable
											return "$p($" + ( varcount++ ) + ",$_);";				
											
										
										}
									// Then join all rows
									).join("") : "";
					
			
					// Create function with overdriven args
					// In secure closure
					// Because we don't want server termination using try
					try {

						i = compile("(function(nTPL,$scope,$args,$p," + args.join(",") + "){$_=[];" + compiled + ";return $_.join('')})", "nTPL.js");
						
					} catch (e) {
						
						// Notify admin about this
						console.log("(" + (name || "blank") + ") >> " + e.toString());
						
						// Return functions that returns nothing
						i = function(){return "";}
						
					}
					
				} else {
					// Else function can return template itself
					i = function(){ return str };
				}
				
				// Because REF_CHECK is internal scoped variable
				// We can use it to check operations
				// But we simply need to return fresh template functions
				// If called in REF_CHECK context
				if (this === REF_CHECK)
					return { i: i, namespace: namespace };
				
				/**
				* Generate arguments array that will be passed to template function
				* @param {array} args Default arguments that was passed on creation
				* @param {object} callArgs Arguments that will be used now
				* @return {array}
				*/
				function createArguments(callArgs,result,i) {
					
					// Store local copy of $r (replacement array)
					var $r = namespace.$r;
					
					/** There're some predefined arguments such as:
					* $scope = namespace,
					* $args = callArgs,
					* $p = function
					*
					* $p is pushing function, declared here to have access to $r variable
					*/
					result = [ $, namespace, callArgs , function (a,$_) {
						
						// Push string or object into global output stack
						return $_[$_.length] = a;					
								
					} ];
					
					for (i in args)					
						result[ result.length ] = callArgs[ args[i] ];
					
					return result;
					
				}				
				
				
				// This function will refresh template
				// If file is reloaded (see watch option)
				refreshTemplate[name] = hasCode ? 
					function(obj) {
						i = obj.i;
						namespace = obj.namespace;
					}
					:
					function (obj) {
						str = obj.i();
					};
					
				/**
				*	And cache it wrapper, that will recreate scope and call original function
				*	If plain - no need in wrapper
				*	@param {object} args arguments to pass
				*	@return {string}
				*/
				local = cache[cache_name] = hasCode ? function (callArgs) {
					// Args can be null
					callArgs = callArgs || {};
			
					// Extend callArgs with namespace
					for ( name in namespace )
						callArgs[name] = namespace[name];
		
					// Attach permament scope to namespace	
					
					// Return result of execution				
					return i.apply(undefined , createArguments( callArgs ));
				} : i ;
				
				// If name is defined
				name &&
					// Add to name cache
					(namecache[name] = local);
				
				// Return wrapper
				if (callback)
					callback(local);
				else
					return local;
			}
		}
		
		// Imported from jQuery
		$.each = function ( object, callback, context ) {
			var name, i = 0, length = object.length;

			if ( length === undefined ) {
				for ( name in object ) {
					if ( !name || object[ name ] === undefined || !object.hasOwnProperty(name) ) continue;
					if ( callback.call( context || object[ name ], name, object[ name ] ) === false ) { break; }
				}
			} else {
				for ( var value = object[0]; i < length && callback.call( context || value, i, value ) !== false; value = object[++i] ){}
			}
			return object;
		}
		
		// Add modificators to nTPL
		$.modificators = modificators;
				
		// Constants and cache
	})( process.compile, "\t" ,  0 ,
	     {} , {} , 
		 {} , /{%|%}/g ,
		 /^([^\s]+)(?:\s|$)/ , /\t/g ,
		 /\s+/g , /%1/);
	
	
	return $;
})();/**@preserve nTPL v.0.0.2;Copyright 2010, Fedor Indutny;Released under MIT license;Parts of code derived from jQuery JavaScript Library;Copyright (c) 2009 John Resig **/