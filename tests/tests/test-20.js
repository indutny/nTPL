this.name = "Filter module tests: upper";
this.run = function(test, ntpl, callback) {
	var a = ntpl("{%filter upper %}abc{%/filter%}")();
	
	test.equal(a, "ABC");
	
}