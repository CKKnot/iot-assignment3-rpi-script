var mysql = require('mysql');
//Set your MYSQL hostname & credential here
const host = "54.158.151.199";
const user = "ckknot";
const password = "12345678";
var connected = false;

var conn = mysql.createConnection({
  connectionLimit : 1,
  host: host,
  user: user,
  password: password,
  multipleStatements: true,
  connectTimeout: 60000
});

var query;

function connectDb(){
  conn.connect(function(err){
    if(err)
      console.error("Connection Error - conn.js: " + err);
    else {
      console.log("Connected to " + host)
      query = conn.query("CREATE DATABASE IF NOT EXISTS sensorDb; USE sensorDb; CREATE TABLE IF NOT EXISTS sensor (time_stamp VARCHAR(255) PRIMARY KEY,soil_moisture INT,ambient_temperature INT,light_intensity INT, light_intensity2 INT, distance INT)");
        if(err)
          console.error("Query Error:\n   Ccannot create database & table on targeted host: " + err);
        else {
          JSON.stringify(result[0].warningCount) == 0
          ? console.log("New database created")
          : console.warn("Database exists, no changes made")
          JSON.stringify(result[0].warningCount) == 0
          ? console.log("New table created")
          : console.warn("Table exists, no changes made")
		  connected = true;
        }
        conn.end();
    }
   });
}

var pool = mysql.createPool({
  connectionLimit : 10,
  host: host,
  user: user,
  password: password,
  multipleStatements: true,
  timezone: "+8:00",
  database: "sensorDb",
  connectTimeout: 60000
});
module.exports = { pool, connectDb }
