this.name = "Arguments without using";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "test",
		args: ["a"]
	})();
	test.equal("test", a);
}