this.name = "Filter module tests: safe";
this.run = function(test, ntpl, callback) {
	var a = ntpl("{%filter safe %}<>&'\"{%/filter%}")();
	
	test.equal(a, "&lt;&gt;&amp;&#039;&quot;");
	
}