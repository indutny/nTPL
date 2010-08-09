this.name = "Block module test";
this.run = function(test, nTPL) {
	nTPL({
		template: "{%block 'a' %}1{%/block%}2{%block 'b'%}3{%/block%}",
		name : "a"
	});
	var a = nTPL({
		template: "{%extends 'a' %}"
	})();
	var b = nTPL({
		template: "{%extends 'a' %}{%block 'a' %}!{%/block%}"
	})();
	var c = nTPL({
		template: "{%extends 'a' %}{%block 'b' %}!{%/block%}"
	})();
	var d = nTPL({
		template: "{%extends 'a' %}{%block 'a' %}~{%/block%}{%block 'b' %}!{%/block%}"
	})();
	test.equal("123!2312!~2!", a + b + c + d);
}