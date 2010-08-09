this.name = "Simple readfile";
this.run = function(test, nTPL) {
	var a = nTPL("./tests/file-1")();
	test.equal("test", a);
}