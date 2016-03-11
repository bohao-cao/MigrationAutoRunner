var multer = require('multer');
var _= require('lodash');
var memStorage = multer.memoryStorage();
//var uploadOption = multer({storage: memStorage});
var uploadOption = multer({dest:'tmp/files/'});
var fs = require('fs');

module.exports = function(app){
	var multerFields = [
		{name: 'files',},
		{name: 'dbConnection'}
	];
	
	app.post('/upload/:server/:userName/:password',uploadOption.single('file'),  function(req, res){
		var date  = fs.readFileSync('tmp/files/');
			
		res.sendStatus(200);
		
	});
};