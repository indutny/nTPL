this.name = "Native parser: modificator tabs & spaces";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set	 	 name test33%}123")();
	var b = nTPL("test33")();
	
	test.equal(a, b);	
	
}