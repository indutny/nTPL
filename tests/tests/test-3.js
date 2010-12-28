this.name = "Simple readfile";
this.run = function(test, ntpl) {
	var a = ntpl("./tests/file-1")();
	test.equal("test", a);
}