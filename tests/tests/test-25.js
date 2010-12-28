this.name = "Block module: 'extends' with arguments";
this.run = function(test, ntpl, callback) {

	var a = ntpl({
		template: "{%= a %}",
		args: ["a"],
		name: "a"
	});
	
	var b = ntpl({
		template: "{%extends 'a', {a: 'test'} %}"
	})();
	
	
	test.equal(b, "test");
	
}