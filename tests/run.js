var fs = require("fs");
var path = require("path");
var test = require("assert");

var nTPL = require("nTPL").plugins('nTPL.block', 'nTPL.filter').nTPL;

var tests = [];

for (var i = 1, filename; path.existsSync( (filename = "./tests/test-" + i) + ".js"); i++)
	tests[i] = require(filename);	
	
var template = [ , "/", total = tests.length - 1, " :: ", , " :: ", ];
var SUCCESS = "SUCCESS";
var FAIL = "FAIL ";


var i = 0, success = 0;

function msg(i, total, name, err) {
	template[0] = i;
	template[2] = total;
	template[4] = tests[i].name;
	template[6] = err ? FAIL + err.message : SUCCESS;
	console.log(template.join(""));
}



function next() {

	i++;
	
	var j = i, once = false;
	
	if (i > total)
		return done();
	
	function testPass(err) {
		if (once)
			return;
			
		once = true;
		
		if (!err)
			success++;
			
		msg(j, total, tests[j].name, err);
		next();
	}
	
	var async = false;
	try {
		if (async = tests[i].run(test, nTPL, testPass)) {
						
		} else {
			
			testPass();
			
		}
		
	} catch (err) {
		
		testPass(err);
	}	
	
}

function done() {
	console.log("Total: " + total + ", Success: " + success);
}

console.log("Running tests");

next();