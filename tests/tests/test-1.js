this.name = "Simple inline";
this.run = function(test, nTPL) {
	var a = nTPL("test")();
	test.equal("test", a);
}