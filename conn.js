//Set your MYSQL hostname/address & credential here
//-----------------------------------------
const host = "localhost";
const user = "ckknot";
const password = "12345678";
const timeZone = "+8:00";
//-----------------------------------------

var mysql = require('mysql');
//SQL connection setup
var conn = mysql.createConnection({
  connectionLimit : 1,
  host: host,
  user: user,
  password: password,
  multipleStatements: true,
  connectTimeout: 10000
});

/*
This function is responsible to connect to the database.
Create database & table if it does not exist on the server.
It will handle error by displaying error message. 
*/
function connectDb(){
  conn.connect(function(err){
    console.log("Database Message: ");
    if(err)
      console.error("  > Connection Error - conn.js: " + err + '\n');
    else {
      console.log("  > Connected to " + host + '\n');
      conn.query("CREATE DATABASE IF NOT EXISTS sensorDb; USE sensorDb; CREATE TABLE IF NOT EXISTS sensor (time_stamp TIMESTAMP, soil_moisture INT, ambient_temperature INT, light_intensity INT, light_intensity2 INT, distance INT)", function(error, results, fields){
        console.log("Database Initialization: ");
        if(error)
          console.error("  > Query Error:\n   Ccannot create database & table on targeted host: " + error);
        else {
          JSON.stringify(results[0].warningCount) == 0
          ? console.log("  > New database created")
          : console.warn("  > Database exists, no changes made")
          JSON.stringify(results[0].warningCount) == 0
          ? console.log("  > New table created")
          : console.warn("  > Table exists, no changes made")
        }
        console.log('\n');
        conn.end();
      });
    }
  });
}

connectDb();
//Create a sql pooling connection for handling concurrent connection & performance purposes.
var pool = mysql.createPool({
  connectionLimit : 10,
  host: host,
  user: user,
  password: password,
  multipleStatements: true,
  timezone: timeZone,
  database: "sensorDb",
  connectTimeout: 10000
});
module.exports = { pool, connectDb }
