this.name = "Filter module tests: safe";
this.run = function(test, nTPL, callback) {
	var a = nTPL("{%filter safe %}<>&'\"{%/filter%}")();
	
	test.equal(a, "&lt;&gt;&amp;&#039;&quot;");
	
}