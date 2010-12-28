this.name = "Async template loading";
this.run = function(test, ntpl, callback) {
	
	var fs = require("fs");
	
	fs.writeFile("./tests/file-18", "123", function(){
		
		ntpl({
			template: "./tests/file-18",
			callback: function (a) {
				callback( a() !== "123" && {message: "Not equal : " + a()} );
			}
		});
		
	});
	
	return true;
}