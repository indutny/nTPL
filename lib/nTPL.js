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
function scopedEval(code,nTPL,$scope,$r) {
	return eval(code);
}
this.nTPL = nTPL = (function() {	
	
	var fs = require('fs');
	var path = require('path');
	var nTPL_native = require('./nTPL.native');
	
	var compile = process.compile;
	
	var $tab = "\t", gid = 0;
	
	var cache = {}, refreshTemplate = {}, namecache = {};
	
	var $brackets = /{%|%}/g;
	
	/** @const */
	var REF_CHECK = {};
	
	/** @const */
	var WATCH = "w";

	/** @const */
	var NAME = "n";
	
	// Modificators
	var modificators = {
	
		// Direct output
		// Can handle jQuery object!
		// Example: {%= "hello world" %}
		/** @return {string} */
		"="	:	function(str) {
			return "$p(" + str + ",$_);"
		},
		
		// "if", "else", "elseif"
		// Example: {%if true%}I'm right!{%else%}I'm wrong{%/if%}
		// {%if false%}I'm wrong{%elseif true%}I'm true!{%/if%}
		/** @return {string} */
		"if": function (str) {
			return "if(" + str + "){";
		},
		
		"else": "}else{",
		
		/** @return {string} */
		"elseif": function(str) {
			return "}else if(" + str + "){";
		},
		
		"/if": "}",	
		
		// Short-hand for each method
		// Example: {%each arr%}<div>{%=this%}</div>{%/each%}
		/** @return {string} */
		"each": function (str) {
			return "nTPL.each(" + str + ",function($i){";
		},
		
		"/each": "});",
		
		// Catch
		// Example: {%catch var a%}<div></div>{%/catch%}{%= a%}
		/** @return {string} */
		"catch" : function (str) {
			return str + "=(function(){var $_=[];";
		},
		
		"/catch" : "return $_.join('')})();"
	};
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
	var $ = function (options) {
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
		
		var arglen = arguments.length, 
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
					// Global template Id, may be used by plugins
					$gid: gid+=1
				},
				local,
				// Index
				i,					
				// Var count
				varcount = 0,
				// Has code inside
				hasCode,
				// Replacements
				$rep;
					
			// Add $_ to scope
			// And check that args is array
			( args instanceof Array) ? (args[ args.length ] = "$_") : (args = ["$_"]);
			
			// If template is not plain (with {% or %} inside) - generate function
			if (hasCode = str.match($brackets)) {
				// Preprocess template				
				// Go through each row
				// And replace it with code
				var parsed = nTPL_native.parse(str, $.modificators, namespace);
				
				// parsed = {replacements: [], code: []}
				var compiled = parsed.code.join("");
				$rep = parsed.replacements;
				
				// Create function with overdriven args
				// In secure closure
				// Because we don't want server termination using try
				try {
					
					i = scopedEval("(function($args," + args.join(",") + "){$_=[];function $p(a,$_){$_[$_.length]=a};" + compiled + ";return $_.join('')})", $, namespace,$rep);
					
				} catch (e) {
					
					// Notify admin about this
					var err = "(" + (name || "blank") + ") :: " + e.toString();
					console.log(err);
					
					// Return functions that returns nothing
					i = function(){return err;}
					
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
				return i;
			
			/**
			* Generate arguments array that will be passed to template function
			* @param {array} args Default arguments that was passed on creation
			* @param {object} callArgs Arguments that will be used now
			* @return {array}
			*/
			function createArguments(callArgs,result,i) {
				
				/** There're some predefined arguments such as:
				* $scope = namespace,
				* $args = callArgs,
				*/
				result = [ callArgs ];
				
				for (i in args)					
					result[ result.length ] = callArgs[ args[i] ];
				
				return result;
				
			}				
			
			
			// This function will refresh template
			// If file is reloaded (see watch option)
			refreshTemplate[name] =	function(_i) {
				delete i;
				i = _i;
			};
				
				
			/**
			*	And cache it wrapper, that will recreate scope and call original function
			*	If plain - no need in wrapper
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
			};
			
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
			for ( var value = object[0]; i < length && callback.call( context || value, i, value ) !== false; value = object[i+=1] ){}
		}
		return object;
	}
	
	// Add modificators to nTPL
	$.modificators = modificators;
			
	// Constants and cache
	
	
	return $;
})();/**@preserve nTPL v.0.0.2;Copyright 2010, Fedor Indutny;Released under MIT license;Parts of code derived from jQuery JavaScript Library;Copyright (c) 2009 John Resig **/