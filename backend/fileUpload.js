var multer = require('multer');
var _= require('lodash');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var sql = require('mssql');
// var uploadOption = multer({storage: memStorage});

module.exports = function(app){
	var multerFields = [
		{name: 'files',},
		{name: 'dbConnection'}
	];
	
	app.post('/upload/:server/:userName/:password/:database',upload.single('file'),  function(req, res){
		console.log(req.file);
		try{
			var ret = fs.readFileSync('uploads/' + req.file.filename,'utf-8');
			//remove utf8's BOM marker
			ret  = ret.replace(/^\uFEFF/, '');

			var config = {
			server: req.params.server,
			user: req.params.userName,
			password: req.params.password,
			database: req.params.database
			};						
		}
		catch(e){
			console.log(e);
		}

		sql.connect(config)
			.then(function(){
				var sqlReq = new sql.Request();
				//sqlReq.multiple = true;
				sqlReq.batch(ret)
				.then(function(recordsets){				
					console.log('send res:' + recordsets);
					//delete file after processing
					fs.unlinkSync('uploads/' + req.file.filename);
					res.send(recordsets);
					})
				.catch(function(err){
					//delete file after processing
					fs.unlinkSync('uploads/' + req.file.filename);
					console.log(err);
					res.status(400).send(err.message);
				});
			})
			.catch(function(err){
				//delete file after processing
				fs.unlinkSync('uploads/' + req.file.filename);
				console.log(err);
				res.status(400).send(err.message);
			});
		
		
	});
};