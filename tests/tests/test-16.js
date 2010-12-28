this.name = "Block module test";
this.run = function(test, ntpl) {
	ntpl({
		template: "{%block 'a' %}1{%/block%}2{%block 'b'%}3{%/block%}",
		name : "a"
	});
	var a = ntpl({
		template: "{%extends 'a' %}"
	})();
	var b = ntpl({
		template: "{%extends 'a' %}{%block 'a' %}!{%/block%}"
	})();
	var c = ntpl({
		template: "{%extends 'a' %}{%block 'b' %}!{%/block%}"
	})();
	var d = ntpl({
		template: "{%extends 'a' %}{%block 'a' %}~{%/block%}{%block 'b' %}!{%/block%}"
	})();
	test.equal("123!2312!~2!", a + b + c + d);
}