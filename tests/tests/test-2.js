this.name = "Simple inline (args is object)";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "test"
	})();
	test.equal("test", a);
}