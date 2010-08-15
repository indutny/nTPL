this.name = "Native mod: set name with tabs";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set name test31	%}123")();
	var b = nTPL("test31")();
	
	test.equal(a, b);	
	
}