this.name = "Filter module tests: upper";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%filter upper %}abc{%/filter%}")();
	
	test.equal(a, "ABC");
	
}