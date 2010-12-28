this.name = "Native mod: set name with many tabs & spaces";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("{%set name 	 	test32	 	 	 %}123")();
	var b = ntpl("test32")();
	
	test.equal(a, b);	
	
}