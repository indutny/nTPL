this.name = "Native mod: set name with tabs";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("{%set name test31	%}123")();
	var b = ntpl("test31")();
	
	test.equal(a, b);	
	
}