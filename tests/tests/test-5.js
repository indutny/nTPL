this.name = "1 Plain & 1 Code";
this.run = function(test, nTPL) {
	var a = nTPL("test-{%= 'test' %}")();
	test.equal("test-test", a);
}