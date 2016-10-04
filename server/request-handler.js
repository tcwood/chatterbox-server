//Imports
var data = require('./classes/messages');
var fs = require('fs');
var path = require('path');
var url = require('url');

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
  console.log(filePath);

  var contentTypeByExt = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js' : 'text/javascript'
  };

  var statusCode;
  if (request.method === 'GET' && request.url === '/classes/messages') {
    headers['Content-Type'] = 'application/JSON';
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
    return;
  } else if (request.method === 'POST' && request.url === '/classes/messages') {
    headers['Content-Type'] = 'application/JSON';
    statusCode = 201;
    request.on('data', function(chunk) {
      chunkObj = JSON.parse(chunk);
      chunkObj.objectId = idCounter;
      idCounter++;
      chunkObj.createdAt = new Date();
      data.results.push(chunkObj);
    });
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
    return;
  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
    headers['Access-Control-Allow-Credentials'] = false;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
    return;
  } 
  else {
    fs.exists(filePath, function(exists) {
      if (!exists) {
        statusCode = 404;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end('404: Not found');
        return;
      }

      if(fs.statSync(filePath).isDirectory()) {
        filePath += 'index.html';
      }

      fs.readFile(filePath, function(error, content) {
        if (error) {
          console.log('ERROR: ' + error);
          headers['Content-Type'] = 'text/plain';
          response.writeHead(500, headers);
          response.end(error + '\n');
          return;
        } else {
          var contentType = contentTypeByExt[path.extname(filePath)];
          if (contentType) {
            headers['Content-Type'] = contentType;
          }
          response.writeHead(200, headers);
          response.end(content, 'utf-8');
        }
      });
    })
  }

  
   // else response.end(JSON.stringify(data));
};

exports.requestHandler = requestHandler;


