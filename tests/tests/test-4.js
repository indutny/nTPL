this.name = "Simple readfile (args is object)";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "./tests/file-1"
	})();
	test.equal("test", a);
}