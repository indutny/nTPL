this.name = "Many Arguments and using it";
this.run = function(test, ntpl) {
	var a = ntpl({
		template: "1-{%= a1 %}-2-{%= a2 %}-3-{%= a3 %}-4-{%= a4 %}",
		args: ["a1","a2","a3","a4"]
	})({
		a1: "a",
		a2: "b",
		a3: "c",
		a4: "d"
	});
	test.equal("1-a-2-b-3-c-4-d", a);
}