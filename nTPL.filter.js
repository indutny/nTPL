(function($ , safereg, rtrim, undefined) {
	var
		/**
		* Expose all filters
		*/
		filters = $.filters = {
			"escape": function ( str ) {
				return escape(str);
			},
			"lower" : function ( str ) {
				return str.toLowerCase();
			},
			"upper" : function ( str ) {
				return str.toUpperCase();
			},
			"safe" : function ( str ) {
				return str.replace(safereg, safe);
			}
		},
		/**
		* Replacements for safe filter
		*/
		safeArr = {
			"<" : "&lt;",
			">" : "&gt;",
			"&" : "&amp;",
			"\"" : "&quot;",
			"'" : "&#039;"
		};
	/**
	* This filter will be used if you call unexisting filtername
	* @param{string} str Input string
	* @return{string}
	*/
	function nopfilter ( str ) {return str};
	
	/**
	* "Safe" replacement function
	* @param{string} str Input string
	* @return{string}
	*/
	function safe( str ) {
		return safeArr[str] || str;
	}
	
	/**
	* This function will be exposed by plugin into template as $scope.$filter
	* @param{string} filter Filter name
	* @param{function} code Scope returning array of strings
	*/
	function filter_func(filter , code) {		
		return (filters[filter] || nopfilter)(code([]).join(""));
	}
	
	/**
	* Add new modificators
	*/
	$.modificators.filter = function ( filter , namespace) {
		
		/**
		* Initiate namespace (add $filter function)
		*/
		!namespace.$filter
			&&
				(namespace.$filter = filter_func);
	
		/**
		* Trim spaces from name or use "escape" if no filter name was passed
		*/
		filter = $trim(filter) || "escape";
		
		return "$p($scope.$filter('" + filter + "',function($_){";
	}
	$.modificators["/filter"] = function ( namespace) {
		return ";return $_}),$_);";
	}
	/* Trim */
	function $trim(text) {
		return (text || "").replace( rtrim, "" );
	}
	
})(nTPL , /<|>|&|"|'/g, /^(\s|\u00A0)+|(\s|\u00A0)+$/g);
/**@preserve jsTPL filter plugin v.0.0.1;Copyright 2010, Fedor Indutny;Released under MIT license;Parts of code derived from jQuery JavaScript Library;Copyright (c) 2009 John Resig **/