'use strict';

var { pool, connectDb } = require('./conn.js');
const mqtt = require('mqtt');
const moment = require('moment');
const { connect } = require('mqtt');
//Set your MQTT topic & credential here
const inTopic = 'iot-assignment3/data';
const outTopic = 'iot-assignment3/response';
const mqttUsername = 'pi';
const mqttPassword = '123456';

/*
This function will manage MQTT connection and topic subscription
*/
var client  = mqtt.connect({host : 'localhost', username : mqttUsername, password : mqttPassword, qos : 0})
client.on('connect', function () {
    client.subscribe(inTopic, function (err) {
        if (err)
            console.error("MQTT subscribe error: " + err);
        else
            console.log("MQTT topic subscribed");
    })
});
client.on('error', function(error) {
    if(error)
        console.error("MQTT connection error: " + error);
});

client.on('message', function (topic, message) {
    console.log("MQTT Message: " + message.toString());
    var regex = RegExp('^\\d{1,4},\\d{1,4},\\d{1,4},\\d{1,4},\\d{1,4}');
    if((regex.test(message.toString()))) {
        //Make our date with time +8:00 according to our Malaysian time zone
        var dataWithTime = moment().add( 8, 'hours' ).toISOString() + "," + message.toString();
        var splitedData =  dataWithTime.split(',');
        
        var query = pool.query('INSERT INTO sensor SET time_stamp = ?, soil_moisture = ?, ambient_temperature = ?, light_intensity = ?, light_intensity2 = ?,  distance = ?', splitedData);//, function (error, results, fields){
            /*if(error){
                console.error("SQL Insert Error: " + error);
                return;
            }
            else
                console.log("Insert query success - controller.js");
            //Check if soil moisture level is less than 100 out of 900+
            if (splitedData[1] < 100){
                client.publish(outTopic, 'dry')
            }
            else
                client.publish(outTopic, 'wet')

            //Check if intruder is within 10 cm out of 400
            if (splitedData[5] < 10)
                client.publish(outTopic, 'intruded')
            else
                client.publish(outTopic, 'safe');
        })*/
        query
            .on('fields', function(fields, index) {
            })
            .on('error', function(error) {
                console.error("SQL Insert Error:\n    " + error);
                connectDb();
            })
            .on('success', function(row, index) {
                console.log("Insert query success:\n    " + row + "\n    at " + index);
            });

        if (splitedData[1] < 100){
            client.publish(outTopic, 'dry')
        }
        else
            client.publish(outTopic, 'wet')

        //Check if intruder is within 10 cm out of 400
        if (splitedData[5] < 10)
            client.publish(outTopic, 'intruded')
        else
            client.publish(outTopic, 'safe');
    }
})
