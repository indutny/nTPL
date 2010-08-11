this.name = "Async template loading";
this.run = function(test, nTPL, callback) {
	
	var fs = require("fs");
	
	fs.writeFile("./tests/file-23", "123", function(){
		
		var b = nTPL({
			template: "./tests/file-23",
			callback: function (a) {
				callback( b !== "" && {message: "Not equal : " + b} );
			}
		})();		
		
	});
	
	return true;
}