this.name = "Template naming test";
this.run = function(test, nTPL) {
	nTPL({
		template: "123{%= a %}",
		name : "a"
	});
	nTPL({
		template: "123{%= a %}",
		name : "a",
		args: ["a"]
	});
	test.equal("1234", nTPL("a")({a: 4}));
}