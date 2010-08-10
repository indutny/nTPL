this.name = "Filter module tests: escape";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%filter escape %}&^%$$#@#!)({%/filter%}")();
	
	test.equal(a, escape("&^%$$#@#!)("));
	
}