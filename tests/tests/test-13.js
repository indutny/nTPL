this.name = "Parser test";
this.run = function(test, nTPL) {
	nTPL.modificators["parser-test1"] = "$p(123,$_);";
	nTPL.modificators["parser-test2"] = function (str, namespace) {
		return "$p('~" + str + namespace + "!',$_);";
	};
	
	var a = nTPL({
		template: "{%parser-test1%}{%parser-test1 %}{%parser-test2%}{%parser-test2 123%}"
	})();

	test.equal("123123~[object Object]!~ 123[object Object]!", a);
}