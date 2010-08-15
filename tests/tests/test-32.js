this.name = "Native mod: set name with many tabs & spaces";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set name 	 	test32	 	 	 %}123")();
	var b = nTPL("test32")();
	
	test.equal(a, b);	
	
}