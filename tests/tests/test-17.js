this.name = "Async working";
this.run = function(test, nTPL, callback) {
	
	setTimeout(function(){
		callback();
	}, 0);
	
	return true;
}