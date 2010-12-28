this.name = "Template naming test";
this.run = function(test, ntpl) {
	ntpl({
		template: "123{%= a %}",
		name : "a"
	});
	ntpl({
		template: "123{%= a %}",
		name : "a",
		args: ["a"]
	});
	test.equal("1234", ntpl("a")({a: 4}));
}