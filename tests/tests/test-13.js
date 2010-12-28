this.name = "Parser test";
this.run = function(test, ntpl) {
	ntpl.modificators["parser-test1"] = "$p(123,$_);";
	ntpl.modificators["parser-test2"] = function (str, namespace) {
		return "$p('~" + str + namespace + "!',$_);";
	};
	
	var a = ntpl({
		template: "{%parser-test1%}{%parser-test1 %}{%parser-test2%}{%parser-test2 123%}"
	})();

	test.equal("123123~[object Object]!~ 123[object Object]!", a);
}