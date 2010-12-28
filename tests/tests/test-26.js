this.name = "Parser: UTF16";
this.run = function(test, ntpl, callback) {
	
	var a = ntpl("абвгд{%= 'еёжз'%}")();
	
	test.equal(a, "абвгдеёжз");	
	
}