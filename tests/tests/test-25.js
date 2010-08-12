this.name = "Parser: comments";
this.run = function(test, nTPL, callback) {

	var a = nTPL({
		template: "{%= a %}",
		args: ["a"],
		name: "a"
	});
	
	var b = nTPL({
		template: "{%extends 'a', {a: 'test'} %}"
	})();
	
	
	test.equal(b, "test");
	
}