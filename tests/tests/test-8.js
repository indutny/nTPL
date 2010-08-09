this.name = "Arguments and using it";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "test-{%= a %}",
		args: ["a"]
	})({
		a: "test"
	});
	test.equal("test-test", a);
}