var multer = require('multer');
var _= require('lodash');
var memStorage = multer.memoryStorage();
var uploadOption = multer({storage: memStorage});

module.exports = function(app){
	app.post('/upload', uploadOption.array('files'), function(req, res){
		console.log(req.files);
		res.sendStatus(200);
	});
};