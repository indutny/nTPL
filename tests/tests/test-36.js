this.name = "Set modificator: singleton with inheritance";
this.run = function(test, ntpl, callback) {
	var a = ntpl("{%set a.b abab %}").options.a.b;
	test.equal("abab",a);
}