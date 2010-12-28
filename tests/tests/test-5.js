this.name = "1 Plain & 1 Code";
this.run = function(test, ntpl) {
	var a = ntpl("test-{%= 'test' %}")();
	test.equal("test-test", a);
}