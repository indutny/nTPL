this.name = "Template naming test";
this.run = function(test, ntpl) {
	ntpl({
		template: "123",
		name : "a"
	});
	test.equal("123", ntpl("a")());
}