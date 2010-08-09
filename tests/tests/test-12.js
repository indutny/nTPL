this.name = "If-Else modificator";
this.run = function(test, nTPL) {
	var a = nTPL({
		template: "{%if true%}123{%/if%}{%if true%}456{%else%}wrong{%/if%}{%if false%}wrong{%else%}789{%/if%}"
	})();
	test.equal("123456789", a);
}