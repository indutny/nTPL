this.name = "Simple inline (args is object)";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "test"
	})();
	test.equal("test", a);
}