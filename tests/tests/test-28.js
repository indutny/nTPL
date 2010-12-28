this.name = "Native mod: set options / one";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("{%set args hello %}{%= hello %}")({hello: "Hello world!"});
	
	test.equal(a, "Hello world!");	
	
}