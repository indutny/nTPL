var assert = require("assert");

require ("./nTPL");
require ("./nTPL.block");


// #1
var a = nTPL({
	template: "123"
})({a: 1});

assert.equal(a, "123");

// #2
var a = nTPL({
	template: "{%= a %}", 
	args: ["a"]
})({a: 1});

assert.equal(a, "1");

// #2
var a = nTPL({
	template: "{%each a %}{%= this %}{%/each%}", 
	args: ["a"]
})({a: [1,3,5] });

assert.equal(a, "135");

// #3
var a = nTPL({
	template: "{%if a %}135{%else%}89{%/if%}", 
	args: ["a"]
})({a: true });

assert.equal(a, "135");

// #4
var a = nTPL({
	template: "{%if a %}135{%else%}89{%/if%}", 
	args: ["a"]
})({a: false });

assert.equal(a, "89");

// #5
var a = nTPL("{%catch var a %}What's up, dude?{%/catch%}{%= a.substr(0,9) %}?")();

assert.equal(a, "What's up?");

// #6
nTPL({
	template: "<b>{%= value%}</b>",
	args: ["value"],
	name: "b"
});
var a = nTPL("b")({value:'Hello world!'});

assert.equal(a, "<b>Hello world!</b>");

// #7

nTPL({
	template: "Hello, {%block 'username'%}{%/block%}!",
	args: [],
	name: "block-test"
});
var a = nTPL("{%extends 'block-test'%}{%block 'username'%}Admin{%/block%}")();

assert.equal(a, "Hello, Admin!");

// #8

var a = nTPL({
	template: "{%= a %}-{%= b %}-{%= c %}",
	args: ["a","b","c"],
})({a: "a", b: "b", c:"c"});
assert.equal(a, "a-b-c");