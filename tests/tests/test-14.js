this.name = "Template naming test";
this.run = function(test, nTPL) {
	nTPL({
		template: "123",
		name : "a"
	});
	test.equal("123", nTPL("a")());
}