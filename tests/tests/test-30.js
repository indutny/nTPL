this.name = "Native mod: set options / semicolon";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set args hello; %}{%= hello %}")({hello: "Hello world!"});
	
	test.equal(a, "Hello world!");	
	
}