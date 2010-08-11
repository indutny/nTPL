require("nTPL");

var tpl = nTPL({
	template: "./complex.html",
	args: ["header", "list"]
});

var list = [{name: "red", current: true, url: "#Red"},
      {name: "green", current: false, url: "#Green"},
      {name: "blue", current: false, url: "#Blue"}];

var output;

var i = 1E6;
var startTime = +new Date;

while (i-->0){
	output = tpl({
		header: "Colors",
		list: list
	});
}
startTime = +new Date - startTime;

console.log("Running time: " + startTime + "ms");