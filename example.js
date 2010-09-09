var nTPL = require("nTPL").plugins('nTPL.block', 'nTPL.filter').nTPL;

var base = nTPL("./tpl/base.html");
	
var home = nTPL("./tpl/index.html");
	
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