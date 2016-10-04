//Imports
var data = require('./classes/messages');
var fs = require('fs');
var path = require('path');
var url = require('url');
var _ = require('underscore');

//global vars and defaults
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};
var headers = defaultCorsHeaders;
var idCounter = 0;


//this function is passed into create server in basic-server.js
var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  //Building complete file path based off of current working directory
  var uri = url.parse(request.url).pathname;
  var filePath = path.join(process.cwd(), 'client/', uri);

  var contentTypeByExt = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript'
  };
  var statusCode;

  
  if (request.url === '/classes/messages' || request.method === 'OPTIONS') {
    if (request.method === 'GET') {
      statusCode = 200;
    } else if (request.method === 'POST') {
      statusCode = 201;
      request.on('data', function(chunk) {
        //Extend message obj with expected properties
        chunkObj = _.extend(JSON.parse(chunk), {
          objectId: idCounter,
          createdAt: new Date()
        });
        data.results.push(chunkObj);
        idCounter++;
      });
    } else {  //If request is OPTIONS...
      statusCode = 200;
      headers['Access-Control-Allow-Credentials'] = false;
    }
    headers['Content-Type'] = 'application/JSON'; 
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
    return;

  } else {
    fs.exists(filePath, function(exists) {
      //File not found
      if (!exists) {
        headers['Content-Type'] = 'text/plain';
        response.writeHead(404, headers);
        response.end('404: Not found');
        return;
      }
      // If requesting root server page, then load client index.html
      if (fs.statSync(filePath).isDirectory()) {
        filePath += 'index.html';
      }

      fs.readFile(filePath, function(error, content) {
        if (error) {  //Internal server error
          headers['Content-Type'] = 'text/plain';
          response.writeHead(500, headers);
          response.end(error + '\n');
          return;
        } else { //Write html, css, js client files
          var contentType = contentTypeByExt[path.extname(filePath)];
          if (contentType) {
            headers['Content-Type'] = contentType;
          }
          response.writeHead(200, headers);
          response.end(content, 'utf-8');
        }
      });
    });
  }
};

exports.requestHandler = requestHandler;


