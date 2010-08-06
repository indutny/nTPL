/**
* @param{array} data internal storage with gid as key
*/
(function ($ , data ,  undefined) {
	
	/** @const */
	var ext = "e";
	/** @const */
	var namespace ="n";
	/** @const */
	var args =  "a";
	/** @const */
	var cached_args = "q";
	/** @const */
	var cached_$_ = "_";
	/** @const */
	var flag = "f";
	/** @const */
	var cached_$p = "p";
	
	
	/**
	* This function will be called everytime with {%extends ... %} statement
	* @param{array} $_ template output stack
	* @param{int} gid id of template
	* @param{string} name name of template to extend
	* @param{object} argums argument that will be passed to template with block values
	*/
	function $extends($_ , $p, gid , name , argums) {
		// Store template into internal storage
		data[gid][ext] = $(name);
		
		// Preprocess and prepare
		argums = argums || {};		
		
		// Change standart join function in output stack array
		// So when output will be created this function will be called
		$_.join = function () {
			
			// Create local output stack
			$_ = [];
			
			// Add block values if we have them
			argums.$blockStack = data[gid][args];			
			
			// Call cached template with arguments
			// And store output into $_ (it will be jQuery object)
			$p(
				data
					[gid]
						[ext](
							argums
						)
			, $_);
			
			
			// Clear storage on this gid
			init(gid);
			
			// Return concatenated value
			return $_.join("");
		}		
		
	}
	
	/**
	* This function will be called everytime with {%block ... %} statement
	* @param{string} name Name of block
	* @param{int} gid Id of template
	* @param{function():string} code Block value function
	* @param{int} flag Is that first call of this function
	* @param{arary} $_ Output stack of template
	*/
	function $block(name, gid, code, flag, $args, $_, $p, cache) {
		// Get data storage for gid
		cache=data[gid];
		
		// If we're here first time (during current run of template)
		if (!flag) {			
			// Cache arguments and stack into storage
			cache[cached_args] = $args;
		} else {
			// If not - get from cache
			$args = cache[cached_args];
		}
		
		// If we are just passing block values to template
		if (cache[ext]) {
		
			// Collect them to local storage
			// Then we will call template passing this like arguments
			(cache = data[gid][args][name]) ?
				(cache[cache.length] = code([]))
				:
				(data[gid][args][name] = [ code([]) ]);
			
			// Stop
			return "";
		}		
		
		// Wow, some template want to pass us some arguments
		// Really?				
		if ( (flag = $args.$blockStack) && flag[name] )		
			// Get first value and slice array
			(cache = (code = flag[name])[0]) && (code.length>1) && (flag[name] = code.slice(1));
		else
			// Simply get source
			cache = code([]);
			
		// And send it all to the output stack
		return cache;
	}
	
	/**
	* This function is initializing datastorage(gid) with namespace
	* @param{int} gid Gid
	* @param{object} namespace Template's namespace
	*/
	function init(gid, namespace) {
		data [gid] = {};
		data [gid][args] = {};
		data [gid][namespace] = namespace || data[gid][namespace];
		data [gid][flag] = 0;
	}
	
	/**
	* This function is extending "init"'s behavior and return gid
	* @param{object} namespace
	* @return{int}
	*/
	function align(namespace) {
		
		// If allready is in local storage
		// Return gid
		if (data[namespace.$gid]) return namespace.$gid;
		
		// Initialize local storage
		init(namespace.$gid, namespace);
		
		// Add default functions
		namespace.$extends = $extends;
		namespace.$block = $block;		
		
		// Return gid
		return namespace.$gid;
	}
	
	// Add modificators
	$.modificators["extends"] = function (str , namespace) {
		
		return "$scope.$extends($_,$p," + align(namespace) +	"," + str + ");";			
		
	};
	$.modificators.block = function (name , namespace) {
			
		return "$p($scope.$block(" + name + "," + align(namespace) + ",function($_){";
			
	};
	$.modificators["/block"] = function (junk, namespace, gid, store) {						
			
		// Mark first time traveling
		store = data[ gid = align(namespace) ][ flag ];					
		data[ gid ][ flag ] = 1;
		
		return ";return $_.join('')},"+store + (store ? ")" : ",$args)") + ",$_);";
		
	};
	
	// Pass some constants
})(nTPL, {});/**@preserve nTPL block plugin v.0.0.1;Copyright 2010, Fedor Indutny;Released under MIT license **/