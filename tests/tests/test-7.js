this.name = "Arguments without using";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "test",
		args: ["a"]
	})();
	test.equal("test", a);
}