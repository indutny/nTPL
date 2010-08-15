this.name = "Express.js integration";
this.run = function(test, nTPL, callback) {
	var fs = require("fs");
	
	fs.writeFileSync("./tests/file-34", "{%set args a1,a2 %}{%= a1 %}:{%= a2 %}");
	
	var a = nTPL.render("express.js@./tests/file-34")({
		a1: 1,
		a2: 2
	});
	var b = nTPL("express.js");
	b = b({
		a1: 1,
		a2: 2
	});
	nTPL.unwatch();
	
	test.equal(a, "1:2");
	test.equal(a, b);
}