this.name = "Simple inline";
this.run = function(test, ntpl) {
	var a = ntpl("test")();
	test.equal("test", a);
}