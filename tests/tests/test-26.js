this.name = "Parser: UTF16";
this.run = function(test, nTPL, callback) {
	
	var a = nTPL("абвгд{%= 'еёжз'%}")();
	
	test.equal(a, "абвгдеёжз");	
	
}