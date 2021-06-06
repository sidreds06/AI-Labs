var mysql      = require('mysql');

var DB = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'projects'
});
 
//connection.connect();
DB.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + DB.threadId);
  });

  module.exports = DB