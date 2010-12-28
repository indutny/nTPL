this.name = "Simple readfile (args is object)";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "./tests/file-1"
	})();
	test.equal("test", a);
}