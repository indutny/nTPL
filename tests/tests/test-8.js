this.name = "Arguments and using it";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "test-{%= a %}",
		args: ["a"]
	})({
		a: "test"
	});
	test.equal("test-test", a);
}