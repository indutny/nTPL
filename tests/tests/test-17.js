this.name = "Async working";
this.run = function(test, ntpl, callback) {
	
	setTimeout(function(){
		callback();
	}, 0);
	
	return true;
}