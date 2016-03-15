var express = require('express');
var multer = require('multer');


var app = express();

// app.get('/', function(req, res){
// 	//res.send('Hello World');
// 	res.json({hello:"World"});
// });
	
var bodyParser = require('body-parser');

//database connection
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/hero');

var allowCrossDomain = function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  //res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extend: true
}));
app.all(allowCrossDomain);

var fileUpload = require('./fileUpload.js')(app);
var connection = require('./connection.js')(app);

var server = app.listen(5000,function(){
	console.log("server running on localhost:5000");
});