this.name = "Set modificator: singleton with inheritance";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%set a.b abab %}").options.a.b;
	test.equal("abab",a);
}