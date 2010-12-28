this.name = "Catch modificator";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "{%catch var a %}test{%/catch%}!{%= a %}!"
	})();
	test.equal("!test!", a);
}