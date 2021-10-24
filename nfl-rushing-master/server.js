//Declaring required frameworks
const http = require('http');
const fs = require('fs');
const express = require('express');
const mysql = require('mysql');
var data = require('./rushing.json');

console.clear();

//Calling express constructor
const app = express();

//Load webpage
app.set("view options", {layout: false});
app.use(express.static('/frontend'));

//Render webpage
app.get('/', function(req, res){
	res.render('/frontend/index.html');
});

var pool;


//Try to connect to mysql database
pool = mysql.createPool({
	host: process.env.MYSQL_HOST_IP,
	port: "3306",
	user: "score",
	password: "hireme",
	database: "db",
	connectionLimit: 10
});

console.log("Server has connected to the database!");


//Create table for the json data
var sqlCommand = "CREATE TABLE rushing (id INT AUTO_INCREMENT PRIMARY KEY, Player VARCHAR(255), Team VARCHAR(255), Pos VARCHAR(255), Att VARCHAR(255), Att_G VARCHAR(255), Yds DECIMAL(8, 2), Avg VARCHAR(255), Yds_G VARCHAR(255), TD DECIMAL(8, 0), Lng VARCHAR(255), 1st VARCHAR(255), 1stpc VARCHAR(255), 20p VARCHAR(255), 40p VARCHAR(255), FUM VARCHAR(255))";

pool.query(sqlCommand, function (err, result) {
	if (err) {
		console.log("Could not query database, shutting down and trying again...");
		process.exit(1);
	}
	console.log("The Table was created!");
});

//Load json data into mysql database
sqlCommand = "INSERT INTO rushing (Player, Team, Pos, Att, Att_G, Yds, Avg, Yds_G, TD, Lng, 1st, 1stpc, 20p, 40p, FUM) VALUES ?";

//Load data into database
data = data.map(val => Object.values(val));
data = data.map(val => val.map(str => str.toString().replace(',', '')));
pool.query(sqlCommand, [data], function(err, result) {
	if(err) {
		console.log("Could not load data, shutting down and trying again...");
		process.exit(1);
	}
	console.log("Data successfully loaded!");

	//Send ordinary table data
	app.get('/getTable/', function(req, res){
		//Get back data from mysql
		sqlCommand = "SELECT * FROM rushing";
		pool.query(sqlCommand, function(err2, dataResult, fields) {
			if(err2) throw err2;

			res.send(dataResult);
		});

	});

	//Send Table sorted by total rushing yards
	app.get('/try/:text?', function(req, res){
		if(typeof req.params.text != 'undefined'){
			//Get back data from mysql
			sqlCommand = "SELECT * FROM rushing WHERE Player LIKE '%" + req.params.text.replace('+', ' ') + "%' ORDER BY Yds";
		}
		else {
			sqlCommand = "SELECT * FROM rushing ORDER BY Yds";
		}
		

		pool.query(sqlCommand, function(err2, dataResult, fields) {
			if(err2) throw err2;

			res.send(dataResult);
		});

	});

	//Send Table sorted by longest rush
	app.get('/lr/:text?', function(req, res){
		if(typeof req.params.text != 'undefined'){
			//Get back data from mysql
			sqlCommand = "SELECT *, CASE WHEN Lng LIKE '%T' THEN TRIM(TRAILING 'T' FROM Lng) ELSE Lng END AS newcol FROM rushing WHERE Player LIKE '%" + req.params.text.replace('+', ' ') + "%' ORDER BY newcol + 0";
		}
		else {
			sqlCommand = "SELECT *, CASE WHEN Lng LIKE '%T' THEN TRIM(TRAILING 'T' FROM Lng) ELSE Lng END AS newcol FROM rushing ORDER BY newcol + 0";
		}

		pool.query(sqlCommand, function(err2, dataResult, fields) {
			if(err2) throw err2;

			res.send(dataResult);
		});

	});

	//Send Table sorted by total rushing touchdowns
	app.get('/trt/:text?', function(req, res){
		if(typeof req.params.text != 'undefined'){
			//Get back data from mysql
			sqlCommand = "SELECT * FROM rushing WHERE Player LIKE '%" + req.params.text.replace('+', ' ') + "%' ORDER BY TD";
		}
		else {
			sqlCommand = "SELECT * FROM rushing ORDER BY TD";
		}
		
		pool.query(sqlCommand, function(err2, dataResult, fields) {
			if(err2) throw err2;

			res.send(dataResult);
		});

	});
});

app.listen(8080);
app.listen(3306);