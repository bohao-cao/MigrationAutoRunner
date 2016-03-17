var multer = require('multer');
var _= require('lodash');
var upload = multer({ dest: 'uploads/' });
var fs = require('fs');
var sql = require('mssql');
var async = require('async');
// var uploadOption = multer({storage: memStorage});

module.exports = function(app){
	var multerFields = [
		{name: 'files',},
		{name: 'dbConnection'}
	];
	
	app.post('/upload/:server/:userName/:password/:database',upload.single('file'),  function(req, res){
		console.log(req.file);
		try{
			var raw = fs.readFileSync('uploads/' + req.file.filename,'utf-8');
			//remove utf8's BOM marker
			raw  = raw.replace(/^\uFEFF/, '');

			queries = _.split(raw, 'GO');
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

		var tasks = [];
		_(queries).forEach(function(query){
			var q = query;
			var f = function runEachQuery(query, callback){
				console.log(query);
				callback(null,query);
				// var sqlReq = new sql.Request();
				// sqlReq.batch(query, function(err, recordsets){
				// 	//delete file after processing
				// 	fs.unlinkSync('uploads/' + req.file.filename);
				// 	if(err)
				// 		callback(err);
					
				//})
			};
			tasks.push(function(callback){
				f(q,callback);

			});
		});

		function finalCallback(err, results){
			if(err)
				res.status(400).send(err.message);
			else
				res.status(200).send(recordsets);
		}

		async.series(tasks,finalCallback);


		// sql.connect(config)
		// 	.then(function(){			
		// 		//TODO: add back here
		// 	})
		// 	.catch(function(err){
		// 		//delete file after processing
		// 		fs.unlinkSync('uploads/' + req.file.filename);
		// 		console.log(err);
		// 		res.status(400).send(err.message);
		// 	});
		
		
	});
};