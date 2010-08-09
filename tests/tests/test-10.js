this.name = "Each modificator";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "{%each a %}-{%= this %}={%= $i %}-{%/each%}",
		args: ["a"]
	})({
		a: ["a","b","c"]
	});
	test.equal("-a=0--b=1--c=2-", a);
}