this.name = "Async template loading";
this.run = function(test, nTPL, callback) {
	
	var fs = require("fs");
	
	fs.writeFile("./tests/file-18", "123", function(){
		
		var b = nTPL({
			template: "./tests/file-18",
			callback: function (a) {
				callback( b !== "" && {message: "Not equal : " + b} );
			}
		})();		
		
	});
	
	return true;
}