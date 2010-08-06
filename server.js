require("./nTPL");
require("./nTPL.block");
require("./nTPL.filter");

var base = nTPL({
		template: "./base.html",
		name: "base"
	});
	
var home = nTPL({
	template: "./index.html",
	name: "home",
	watch: true	
});
	
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(
	home()
  ); 
}).listen(80, "127.0.0.1");

console.log('Server running at http://127.0.0.1:80/');