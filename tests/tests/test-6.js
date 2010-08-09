this.name = "4 Plain & 4 Code";
this.run = function(test, nTPL) {
	var a = nTPL("12-{%= '34' %}-56-{%= '78' %}-90-{%= '12' %}-34-{%= '56' %}")();
	test.equal("12-34-56-78-90-12-34-56", a);
}