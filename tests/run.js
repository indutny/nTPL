var fs = require("fs");
var path = require("path");
var test = require("assert");

require("../lib/nTPL");
require("../lib/nTPL.block");
require("../lib/nTPL.filter");

var tests = [];

for (var i = 1, filename; path.existsSync( (filename = "./tests/test-" + i) + ".js"); i++)
	tests[i] = require(filename);	
	
var template = [ , "/", total = tests.length - 1, " :: ", , " :: ", ];
var SUCCESS = "SUCCESS";
var FAIL = ["FAIL ",];


for (var i = 1, success = 0; i <= total; i++) {
	try {
		tests[i].run(test, nTPL);
		success++;
		template[6] = SUCCESS;
	} catch (err) {
		template[6] = FAIL.join(err);
	}
	template[0] = i;
	template[2] = total;
	template[4] = tests[i].name;
	console.log( template.join("") );
}

console.log("Total: " + total + ", Success: " + success);