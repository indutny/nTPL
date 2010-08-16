this.name = "Set modificator: multivalue with inheritance";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%set a.b 1,2,3 %}").options.a.b;
	test.equal("1-2-3",a.join("-"));
}