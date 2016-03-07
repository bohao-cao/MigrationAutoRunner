var multer = require('multer');
var _= require('lodash');
var memStorage = multer.memoryStorage();
var uploadOption = multer({storage: memStorage});

module.exports = function(app){
	var multerFields = [
		{name: 'files',},
		{name: 'dbConnection'}
	];
	//
	app.post('/upload/:server/:userName/:password',uploadOption.any(),  function(req, res){
		console.log(req.files);
		res.sendStatus(200);
	});
};