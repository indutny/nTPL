this.name = "Native parser: modificator tabs & spaces";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("{%set	 	 name test33%}123")();
	var b = ntpl("test33")();
	
	test.equal(a, b);	
	
}