this.name = "Parser: comments";
this.run = function(test, nTPL, callback) {

	var a = nTPL("You can{*'t*} see this")();
	test.equal(a, "You can see this");	
	
}