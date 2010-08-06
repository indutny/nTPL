require ("./nTPL");
require ("./nTPL.block");

var tNum = 0;
var errNum = 0;

function assertEqual(a,b) {
	
	if (a != b) {
		errNum++;
		console.log( "test #" + tNum + " failed");
		console.log( "Expected :" + b);
		console.log( "Got :" + a);
	}
	tNum++;
}

// #1
var a = nTPL({
	template: "123"
})({a: 1});

assertEqual(a, "123");

// #2
var a = nTPL({
	template: "{%= a %}", 
	args: ["a"]
})({a: 1});

assertEqual(a, "1");

// #2
var a = nTPL({
	template: "{%each a %}{%= this %}{%/each%}", 
	args: ["a"]
})({a: [1,3,5] });

assertEqual(a, "135");

// #3
var a = nTPL({
	template: "{%if a %}135{%else%}89{%/if%}", 
	args: ["a"]
})({a: true });

assertEqual(a, "135");

// #4
var a = nTPL({
	template: "{%if a %}135{%else%}89{%/if%}", 
	args: ["a"]
})({a: false });

assertEqual(a, "89");

// #5
var a = nTPL("{%catch var a %}What's up, dude?{%/catch%}{%= a.substr(0,9) %}?")();

assertEqual(a, "What's up?");

// #6
nTPL({
	template: "<b>{%= value%}</b>",
	args: ["value"],
	name: "b"
});
var a = nTPL("b")({value:'Hello world!'});

assertEqual(a, "<b>Hello world!</b>");

// #7

nTPL({
	template: "Hello, {%block 'username'%}{%/block%}!",
	args: [],
	name: "block-test"
});
var a = nTPL("{%extends 'block-test'%}{%block 'username'%}Admin{%/block%}")();

assertEqual(a, "Hello, Admin!");


console.log("Errors: " + errNum + ", Total: " + tNum);