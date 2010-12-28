this.name = "Filter module tests: upper";
this.run = function(test, ntpl, callback) {
	var a = ntpl("{%filter lower %}ABC{%/filter%}")();
	
	test.equal(a, "abc");
	
}