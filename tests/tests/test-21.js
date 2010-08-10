this.name = "Filter module tests: upper";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%filter lower %}ABC{%/filter%}")();
	
	test.equal(a, "abc");
	
}