this.name = "Native mod: set name";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("{%set name test %}123")();
	var b = ntpl("test")();
	
	test.equal(a, b);	
	
}