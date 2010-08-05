nTPL = (function($,undefined) {

	/** Escaping closure
	 * Only global variables will be available here
	 * @param{string} a Code to evaluate
	 * @param{string} b Variable to store output
	 * @return {Function}
	 */
	function $eval(a,b) {
		return eval(a);
	}
 
    (function ($tab , gid ,
	           cache , refreshTemplate,
			   namecache , $brackets ,
			   $modificator , $tabs ,
			   $spaces , $decorator ,
			   modificators) {				
				
				var fs = require('fs');
				var path = require('path');
				
				// Modificators
				modificators = {
				
					// Direct output
					// Can handle jQuery object!
					// Example: {%= "hello world" %}
					/** @return {string} */
					"="	:	preg_decorate("$p(%1,$_);"),					
					
					// Short-hand for functions
					// Example: {%@ log() {console && console.log.apply(this,arguments);} %}
					/** @return {string} */
					"@"	:	preg_decorate("function %1"),
					
					// Short-hand for scopes
					// Example: {%~ alert(1) %}
					/** @return {string} */
					"~"	:	preg_decorate("(function(){%1})();"),
					
					// Short-hand for templates
					// Example: {%:templatename {arg1:val1,arg2:val2} %}
					/** @return {string} */
					":" : function (str , name) {
					
						name = str.match($modificator);
						
						return "$p(jsTPL('" + name[1] + "')(" + str.substr(name[0].length) + "),$_);";
					},
					
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
					"each": preg_decorate("jsTPL.each(%1,function($i){"),
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
		
		function watchChanges(filename, process) {
			var name = process._name, refreshFunc;
			
			if (name) {					
				fs.watchFile(filename, {persistent:true, interval: 100}, function() {
					fs.readFile(filename, function (err, data) {
						if (err)
							return;
						
						if (refreshFunc = refreshFunc || refreshTemplate[name]) {
							refreshFunc(process.call(this, data.toString(), {
								refresh: true
							}));
						}
					});
					
				});
			}
		}
		
		function readTemplateAsync(filename, process, callback) {
			path.exists(filename, function(exists) {
				if (!exists)
					return callback(filename);
					
				fs.readFile(filename, function (err, data) {
					if (err)
						callback(filename);
					
					callback(data.toString());
				});
				
				watchChanges(filename, process);
			});
			return filename;
		}
		
		function readTemplateSync(filename, process) {
		
			if (!path.existsSync(filename))
				return filename;
			
			watchChanges(filename, process);
						
			return fs.readFileSync(filename).toString();
			
		}
		
		/**
		* Generate, cache, return template
		* $.template("name") - get cached template with name
		* $.template("%template%", {args}, [name]) - generate template and optionally give it a name
		* Args = Template arguments
		* @param {string} str Input template, or template name
		* @return {function(object): object}
		*/
		$ = function (str , args, name) {
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
			
			var callback;
			
			if (arglen == 2 && typeof args == "function")
				callback = args;
			else if (arglen == 3 && typeof name == "function")
				callback = args;
			else if (arglen == 4 && typeof $arguments[3] == "function")
				callback = $arguments[3];

			process._name = name;
				
			if (!callback) {											
				return process(readTemplateSync(str, process));
			} else {
				readTemplateAsync(str, process, function (data) {					
					process(data, {
						callback: callback
					});
				});
			}
			
			function process(str, options) {			
				options = options || {};
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
					varcount = 0;							
						
				// Add $_ to scope
				// And check that args is array
				( args instanceof Array) ? (args[ args.length ]="$_") : (args = ["$_"]);
				
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
						varname = "$" + varcount;					
						args.push(varname);					
						namespace[ varname ] = elem;
						
						// So, instead of inline printing we will print variable
						return "$p($" + ( varcount++ ) + ",$_);";				
						
								
					}
				// Then join all rows
				).join("") : "";
				
		
				// Create function with overdriven args
				// In secure closure
				i = $eval("b=function($scope,$args,$p," + args.join(",") + "){$_=[];" + compiled + ";return $_.join('')}");						
				
				if (options.refresh)
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
					result = [ namespace, callArgs , function (a,$_) {
						
						// Push string or object into global output stack
						return $_[$_.length] = a;					
								
					} ];
					
					for (i in args)					
						result[ result.length ] = callArgs[ args[i] ];
					
					return result;
					
				}				
				
				refreshTemplate[name] = function(obj) {
					i = obj.i;
					namespace = obj.namespace;
				};
				/**
				*	And cache it wrapper, that will recreate scope and call original function
				*	@param {object} args arguments to pass
				*	@return {string}
				*/
				local = cache[cache_name] = function (callArgs) {
					// Args can be null
					callArgs = callArgs || {};
			
					// Extend callArgs with namespace
					for ( name in namespace )
						callArgs[name] = namespace[name];
		
					// Attach permament scope to namespace	
					
					// Return result of execution				
					return i.apply(undefined , createArguments( callArgs ));
				}			
				
				// If name is defined
				name &&
					// Add to name cache
					(namecache[name] = local);
				
				// Return wrapper
				if (options.callback)
					options.callback(local);
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
		
		// Add modificators to $.template
		$.modificators = modificators;
				
		// Constants and cache
	})( "\t" ,  0 ,
	     {} , {} , 
		 {} , /{%|%}/g ,
		 /^([^\s]+)(?:\s|$)/ , /\t/g ,
		 /\s+/g , /%1/);
	
	
	return $;
})();/**@preserve nTPL v.0.0.1;Copyright 2010, Fedor Indutny;Released under MIT license;Parts of code derived from jQuery JavaScript Library;Copyright (c) 2009 John Resig **/