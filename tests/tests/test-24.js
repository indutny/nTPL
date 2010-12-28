this.name = "Parser: comments";
this.run = function(test, ntpl, callback) {

	var a = ntpl("You can{*'t*} see this")();
	test.equal(a, "You can see this");	
	
}