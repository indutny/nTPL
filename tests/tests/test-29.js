this.name = "Native mod: set options / multiple";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("{%set args arg1,arg2,arg3 %}{%= arg1 %}-{%= arg2 %}-{%= arg3 %}")({
		arg1: "abc",
		arg2: "def",
		arg3: "ghi"
	});
	
	test.equal(a, "abc-def-ghi");	
	
}