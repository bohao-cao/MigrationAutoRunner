var mongoose = require('mongoose');

var connProfileSchema = mongoose.Schema({
	profileName: {type:[String], unique:true},
	server: String,
	userName: String,
	password: String,
	database: String
});


module.exports = mongoose.model('ConnProfile', connProfileSchema);