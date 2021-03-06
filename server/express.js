var express = require('express');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

var getNextId = (results) => id = results.length > 0 ? results[results.length - 1].objectId + 1 : 1;

//load static html/css/js
app.use(express.static(path.join(process.cwd(), 'client')));

app.use('/*', function(req, res, next) {
  res.header('access-control-allow-origin', '*');
  res.header('access-control-allow-headers', 'origin, x-requested-with, content-type, accept');
  next();
});

app.route('/classes/messages')
  .get(function(req, res) {
    var dataPath = __dirname + '/classes/messages.json';
    fs.readFile(dataPath, 'utf8', function(error, data) {
      if (error) {
        console.log(error);
      } else {
        res.send(data);
      }
    });
  })
  .post(function(req, res) {
    var dataPath = __dirname + '/classes/messages.json';
    fs.readFile(dataPath, function(error, data) {
      if (error) {
        console.log(error);
      } else {
        var currentData = JSON.parse(data);
       // Generate objectId
        var id = getNextId(currentData.results);
        //Extend message obj with expected properties
        var existingData = JSON.parse(Object.keys(req.body)[0]);
        chunkObj = _.extend(existingData, {
          objectId: id,
          createdAt: new Date()
        });
        currentData.results.push(chunkObj);
        fs.writeFile(dataPath, JSON.stringify(currentData));
        res.sendStatus(201);
      }
    });
  });

//OPTIONS
app.options('/*', function(req, res) {
  res.header('access-control-allow-origin', '*');
  res.header('access-control-allow-headers', 'origin, x-requested-with, content-type, accept');
  res.header('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', false);
  res.sendStatus(200);
});

app.use(function(req, res) {
  res.status(404).send('404: Not found');
});

app.listen(3000, '127.0.0.1');
