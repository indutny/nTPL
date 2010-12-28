var ntpl = require("ntpl").plugins('ntpl.block', 'ntpl.filter').ntpl;

var base = ntpl({
  template: "./tpl/base.html",
  watch: true
});
	
var home = ntpl({
  template: "./tpl/index.html",
  watch: true
});
	
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(home({
      username: "Paul",
      userfax: "12345678",
      usermail: "a@a.com"
    })); 
}).listen(80, "127.0.0.1");

console.log('Server running at http://127.0.0.1:80/');
