this.name = "Filter module tests: escape";
this.run = function(test, ntpl, callback) {
	var a = ntpl("{%filter escape %}&^%$$#@#!)({%/filter%}")();
	
	test.equal(a, escape("&^%$$#@#!)("));
	
}