this.name = "Native mod: set name";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set name test %}123")();
	var b = nTPL("test")();
	
	test.equal(a, b);	
	
}