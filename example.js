require("nTPL");
require("nTPL.block");
require("nTPL.filter");

var base = nTPL({
	template: "./tpl/base.html",
	watch: true
});
	
var home = nTPL({
	template: "./tpl/index.html",
	watch: true	
});
	
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(
	home({
		username: "Paul",
		userfax: "12345678"
	})
  ); 
}).listen(80, "127.0.0.1");

console.log('Server running at http://127.0.0.1:80/');