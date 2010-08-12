this.name = "Parser: comments";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{* *}")();
	
	console.log(a);
	test.equal(a, "you can see this");
	
	
}