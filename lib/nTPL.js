/*
*	Usage:
*		require("./nTPL");
*		nTPL({
*			template: filename or inline template (@string),
*			name: template name (template will be accessible with this name) (@string),
*			args: arguments list (@array),
*			watch: Should reload template if file changed (@boolean),
*			callback: If callback provided - all things will be done in async mode,
*					  and callback will be fired (@function(template function) )
*			watchCallback: Fired on file change (@function(template function) )
*		});
*
*		nTPL(...) will generate(or return previously generated) template function,
*		that returns string value
*
*		Also nTPL.modificators are available
*		See nTPL.block and nTPL.filter for examples of usage
*/
/**
*	@param {string} $src Template source
*	@param {object} nTPL nTPL object
*	@param {object} $scope namespace
*	@param {array} $r replacements
*	@return {string}
*/
function scopedEval($src,nTPL,$scope,$rep) {
	return eval($src);
}
exports.parse = nTPL = (function() {	
	
	var fs = require('fs');
	var path = require('path');
	var nTPL_native = require('nTPL.native');
	
	var $tab = "\t", gid = 0, rid = 0;
	
	var refreshTemplate = [], namecache = {};
	
	var fileWatchers = [];
	
	var $brackets = /{%|%}/g;
	
	/** @const */
	var REF_CHECK = {};
	
	/** @const */
	var WATCH = "w";

	/** @const */
	var REFRESH_ID = "r";
	
	// Modificators
	var modificators = {
		// Direct output
		// Example: {%= "hello world" %}
		/** @return {string} */
		"=": function (str) {
			return "$p(" + str + ",$_);";
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
	
	// Add native modificators
	if (nTPL_native.initModificators)
		nTPL_native.initModificators(modificators);
	
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
			
		var refresh_id = parse[REFRESH_ID], refreshFunc;
		
		// Store filename for future unWatch
		fileWatchers[fileWatchers.length] = filename;
		
		fs.watchFile(filename, {persistent: true, interval: 100 }, function() {
			
			fs.readFile(filename, function (err, data) {
				if (err)
					return;
				
				// Sometimes watchFile can be called before
				// template actually builds
				// check this out
				if (refreshFunc = refreshFunc || refreshTemplate[refresh_id]) {
					refreshFunc(parse.call(REF_CHECK, data.toString()));
				}				
				
			});
			
		});
		
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
	*   As object or as string
	*   Object: {
	*		template: "...", // filename or string
	*		args: ["arg1", ..., "argN"], //	template arguments
	*		callback: function(generatedTemplate){}, // will load template from file asynchronously
	*		watch: true/false, // Rebuild template on file refresh
	*		watchCallback: function(generatedTemplate){} // Called on rebuild
	*   }
	*
	*	@param {object} options Calling options
	*	@return {function(object): object}
	*/
	var $ = function (options) {
		// If options is string - generate template
		if (typeof options === "string")
			return $main(options);
			
		// Cache for better compression
		var
			_template = options.template || "",
			_args = options.args,
			_name = options.name;
			
		// If we have only name - pass it as first arguments
		if (_name && !_template && !_args)
			return $main(_name);
		
		// If we at least have template - call normal
		if (_template)
			return $main(_template, _args || [], _name, options.callback, options.watch, options.watchCallback);
	}
	/**
	* Generate, cache, return template
	* $main("name") - get cached template with name
	* $main("%template%", {args}, [name]) - generate template and optionally give it a name
	* Args = Template arguments
	* @param {string} str Input template, or template name
	* @param {array} args Predefined arguments
	* @param {string} name Template name
	* @param {function(function(object): object): boolean} callback Callback for asynchronous mode
	* @param {boolean} watch Watch file changes or not?
	* @param {function(function(object): object): boolean} watchCallback When file is changed - this callback will be fired
	* @return {function(object): object}
	*/
	function $main(str , args, name, callback, watch, watchCallback) {
		var arglen = arguments.length, 
			// Args converted to string
			// Need them for caching
			cache_name,
			// Need for async load
			replaceScope,
			// This template
			tpl,
			// Generate refresh_id
			refresh_id = rid+=1,
			// Possible filename, store it,
			filename = name,
			// Index
			i;
			
		// If have been cached by name
		// $.template("name")		
		if (arglen === 1 && (i = namecache[str]))
			return i;
		
		// Store refresh_id & watch option
		// So they will be accessible in readTemplateSync/Async
		parse[REFRESH_ID] = refresh_id;
		parse[WATCH] = watch;
		
		// If we don't have callback
		if (!callback) {			
			// Do all work in sync
			str = readTemplateSync(str, parse);
		} else {
			// Do all work in async
			readTemplateAsync(str, parse, function (data) {					
				if (replaceScope) {
					// Everything is ok
					if (tpl)
						// If we have template - change references in it
						replaceScope(parse.call(REF_CHECK, data));
					else
						// Generate new template
						tpl = parse(data);
				} else {
					// Some error, template is undefined now
					tpl = parse(str);
				}
				callback(tpl);
			});
			// Return empty template before loading
			str = "";
		}
		
		// If we have template - return it and save to know
		// that it was generated
		//
		// Otherwise generate template
		return tpl = tpl || parse(str);
		
		/**
		* Parsing input template with options
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
				$rep,
				// Store name (isolate from $main scope)
				_name = name,
				// Isolate from $main scope
				_args;
					
			// Add $_ to scope
			// And check that args is array
			( args instanceof Array) ?
				((_args = args)[ args.length ] = "$_")
				:
				(_args = args = ["$_"]);
			
			var options = {};
			// Preprocess template				
			// Go through each row
			// And replace it with code
			var parsed = nTPL_native.parse(str, $.modificators, namespace, options);
			
			// If template is not plain (with {% or %} inside) - generate function
			if (hasCode = parsed && (parsed.replVars.length > 1 || parsed.code.length > 0 )) {
				// parsed = {replacements: [], code: []}
				var compiled = parsed.code.join("");
				var replVars = parsed.replVars;
				
				$rep = parsed.replacements;
				
				// If template is using options
				if (options) {
					var oargs = options.args;
					
					// If arguments returned
					if (oargs) {
						// If oargs not array - make it array!
						
						if (!oargs instanceof Array)
							oargs = [oargs];
						
						// If args added
						if (_args.length)
							// Add arguments
							_args = _args.concat(oargs);
					}
					
					// If name added - change it
					if (name = options.name || name)
						// If array - convert it
						name = name.toString();
										
				}
				
				replVars = replVars.length? "$" + replVars.join(",$"): "";
				
				// Create function with overdriven args
				// In secure closure
				// Because we don't want server termination using try
				try {
					
					i = scopedEval("(function(" + replVars + "){\
						return (function($args,$scope," + _args.join(",") + "){\
							$_=[];\
							function $p(a,$_){$_[$_.length]=a};" +
							compiled + ";\
							return $_.join('')\
						})\
					}).apply(this, $rep);", $, namespace, $rep);
					
				} catch (e) {
					
					// Notify admin about this
					var err = "(" + (name || "no-file") + ") :: " + e.message;
					
					// Return functions that returns nothing
					i = function(){return err;}
					
				}
				
			} else {
				// Else function can return template itself
				str = parsed.replVars[0] || str;
				i = function(){ return str};
			}
			
			// Because REF_CHECK is internal scoped variable
			// We can use it to check operations
			// But we simply need to return fresh template functions
			// If called in REF_CHECK context
			if (this === REF_CHECK)
				return {i: i, args: _args, name: name};
			
			/**
			* Generate arguments array that will be passed to template function
			* @param {array} args Default arguments that was passed on creation
			* @param {object} callArgs Arguments that will be used now
			* @return {array}
			*/
			function createArguments(callArgs,result,i) {
				
				/** There're some predefined arguments such as:
				* $args = callArgs,
				* $scope = namespace,
				*/
				result = [ callArgs , namespace];
				
				for (i in _args)
					result[ result.length ] = callArgs[ _args[i] ];
				
				return result;
				
			}				
			
			
			/**
			*	And cache it wrapper, that will recreate scope and call original function
			*	If plain - no need in wrapper
			*	@param {object} args arguments to pass
			*	@return {string}
			*/
			local = function (callArgs) {
				// Args can be null
				callArgs = callArgs || {};
		
				// Extend callArgs with namespace
				for ( name in namespace )
					callArgs[name] = namespace[name];
	
				// Attach permament scope to namespace	
				
				// Return result of execution				
				return i.apply(local , createArguments( callArgs ));
			};
			
			// This function will refresh template
			// If file is reloaded (see watch option)			
			refreshTemplate[refresh_id] = replaceScope = function(o) {
				
				// Refresh function
				i = o.i;
				
				// Refresh arguments
				_args = o.args;
				
				// If name was changed
				if ( _name !== o.name ) {
				
					// Copy if name is given
					if (o.name)
						namecache[o.name] = local;
					
					// Delete old
					namecache[_name] = undefined;
					
					_name = o.name;
				}
				
				
				// Notify possible listeners
				watchCallback && watchCallback(o);
			};
			
			// Expose unwatch
			local.unwatch = function() {
				try {
					fs.unwatchFile(filename);
				} catch (e) {
				}
			}
			
			// Expose options
			local.options = options;
			
			
			// If name is defined
			if (name) {
				// Add to name cache
				namecache[name] = local;
			
			}
			
			// Return wrapper
			if (callback)
				callback(local);
			else
				return local;
		}
	}
	
	// Imported from jQuery
	$.each = function ( object, callback) {
		var name, i = 0, length = object.length;

		if ( length === undefined ) {
			for ( name in object ) {
				if ( !name || object[ name ] === undefined || !object.hasOwnProperty(name) ) continue;
				if ( callback.call( object[ name ], name, object[ name ] ) === false ) { break; }
			}
		} else {
			for ( var value = object[0]; i < length && callback.call( value, i, value ) !== false; value = object[i+=1] ){}
		}
		return object;
	}
	
	// Add modificators to nTPL
	$.modificators = modificators;
	
	/**
	*	Express.js possible integration
	* @param{string} str "templatename@templatefile"
	*/
	exports.render = $.render = function(str, args) {
		str = str.split("@",2);
		
		var cached;
		
		return ((cached = namecache[str[0]]) ?
			cached
			:
			$({
				name: str[0],
				template: str[1],
				watch: true
			}))(args);
	}
	
	// On Exit
	process.on('exit', $.unwatchAll = function() {
		try {
			for (var i = 0 , len = fileWatchers.length; i < len; i++)
				fs.unwatchFile(fileWatchers[i]);
		} catch (err) { 
			console.log(err);
		}
	});
	
	// Catch exceptions
	process.on('uncaughtException', function (err) {
		console.log('nTPL caught exception: ' + err);
	});
	return $;
})();/**@preserve nTPL v.0.4.0;Copyright 2010, Fedor Indutny;Released under MIT license;Parts of code derived from jQuery JavaScript Library;Copyright (c) 2009 John Resig **/