this.name = "Catch modificator";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "{%catch var a %}test{%/catch%}!{%= a %}!"
	})();
	test.equal("!test!", a);
}