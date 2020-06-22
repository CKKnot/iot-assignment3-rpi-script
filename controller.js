'use strict';
//Set your MQTT topic & credential here
//------------------------------------------
const inTopic = 'iot-assignment3/data';
const outTopic = 'iot-assignment3/response';
const mqttUsername = 'pi';
const mqttPassword = '123456';
//------------------------------------------

var { pool, connectDb } = require('./conn.js');
const mqtt = require('mqtt');
const moment = require('moment');
const { connect } = require('mqtt');
var os = require('os');
var ifaces = os.networkInterfaces();

/*
This function will get available interface type and ip address for the MQTT client to connect to
*/
function GetIpAddress(){
    var ipAdresses = "";
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) 
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            if (alias >= 1) 
                // this single interface has multiple ipv4 addresses
                ipAdresses += "  > " + ifname + ':' + alias + " " + iface.address + "\n";
            else
                // this interface has only one ipv4 adress
                ipAdresses += "  > " + ifname + ':' + alias + " " + iface.address + "\n";
            ++alias;
        });
    });
    return ipAdresses;
}

/*
This function will manage MQTT connection and topic subscription
*/
var client  = mqtt.connect({host : 'localhost', username : mqttUsername, password : mqttPassword, qos : 0})
client.on('connect', function () {
    client.subscribe(inTopic, function (err) {
        if (err)
            console.error("MQTT subscribe error: " + err);
        else {
            console.log("MQTT topic subscribed!\nMQTT Broker Interface types and IP Addresses for MQTT client to connect to:");
            console.log(GetIpAddress());
        }
    })
});
client.on('error', function(error) {
    if(error)
        console.error("MQTT connection error: " + error);
});

//On MQTT message received, we format the csv data,
//prepare SQL query, make SQL query requests, 
//automation on what to trigger on data inferred
//handles any error and output error information,
//MQTT message console output as information
client.on('message', function (topic, message) {
    console.log("MQTT Message: " + message.toString());
    var regex = RegExp('^\\d{1,4},\\d{1,4},\\d{1,4},\\d{1,4},\\d{1,4}');
    if((regex.test(message.toString()))) {
        //Make our date with time +8:00 according to our Malaysian time zone
        var dataWithTime = moment().add( 8, 'hours' ).toISOString() + "," + message.toString();
        var splitedData =  dataWithTime.split(',');
        
        var query = pool.query('INSERT INTO sensor SET time_stamp = ?, soil_moisture = ?, ambient_temperature = ?, light_intensity = ?, light_intensity2 = ?,  distance = ?', splitedData);
        query
            .on('error', function(error) {
                console.error("SQL Insert Error:\n  > " + error);
                connectDb();
            })
        //Check if soil moisture is below 100
        if (splitedData[1] < 100){
            client.publish(outTopic, 'dry');
        }
        else
            client.publish(outTopic, 'wet');
        //Check if intruder is within 10 cm out of 400
        if (splitedData[5] < 10)
            client.publish(outTopic, 'intruded');
        else
            client.publish(outTopic, 'safe');
    }
})
