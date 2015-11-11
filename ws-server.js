//OPER - ECCI - UCR - ricardogang@gmail.com

//DATABASE
var fs = require("fs"),
  fileDB = "process.db",
  exists = fs.existsSync(fileDB),
  domain = require('domain'),
  dbDomain= domain.create(),
  EventEmitter = require('events').EventEmitter,
  emitter= new EventEmitter(),
  sqlite3 = require("sqlite3").verbose(),
  db = new sqlite3.Database(fileDB),
  url = require('url'),
  rootFolder = '/',
  defaultFileName = '/db.html',
  csvData="" ;
  
  function setupDB (data) {
      db.serialize(function() {
        if(!exists) {
          db.run("CREATE TABLE Process (ip TEXT, date TEXT, data TEXT)", function(err, row) {
            if (!err===null){
              console.log("DB ERROR CREATING DB: "+err.message);
            } else {
              console.log("DB CREATED") ; 
            }
          });
        }
      });
  }
    
  function addToDB(x,ip,date,data) {
    var insertStatement="INSERT INTO Process (ip,date,data) VALUES ('"+ip+"','"+Date.now()+"','"+data+"');";
    var stmt = db.prepare(insertStatement,function(err, row) {
      if(!err===null){
        console.log("DB ERROR: "+err);
      }
    }); 
    stmt.run() ;
    stmt.finalize() ;
  }
    
  function dbToCSV() {
    console.log("DB:");
    db.serialize(function() {
      var html="\<DOCTYPE html\>\<html\>\<style\>table, td \{border\: 1px solid black\;border\-collapse\: collapse;\}\<\/style\>\<table\>";
    
      db.all("SELECT rowid AS id, ip, date, data FROM Process", function(err, rows) {
        if(!err===null){
          console.log("DB ERROR: "+err);
        }
        csvData="";
        rows.forEach(function (row){
          csvData+= row.id+','+row.ip+','+row.date+','+row.data+'\n';
          html+="\<tr\>\<td\>"+row.id + "\<\/td\>\<td\>" + row.ip+"\<\/td\>\<td\>"+row.date+"\<\/td\>\<td\>"+row.data+"\<\/td\>\<\/tr\>";
        })
        html+="\<\/table\>\<\/body\>\<\/html\>" ;
        //console.log("DB IN HTML:"+html);
        fs.writeFile('db.html', html, function (err) {
          if (err) {
            return console.log("ERROR WRITING FILE: "+err);
          }
        });
        
      });
    });
  }

dbDomain.run(function () {
  if(!exists) {
    console.log("Creating DB file.");
    fs.openSync(fileDB, "w");
  }

  this.add(emitter);
  
  emitter.on('setupDB',setupDB);
  emitter.on('EaddToDB', addToDB);
  emitter.on('dbToCSV',dbToCSV);
  
  emitter.emit('setupDB') ;
});

dbDomain.on('error', function (error) {
  console.error('DB DOMAIN ERROR:', error);
  dbDomain.dispose();
});


//SERVER
var http = require("http"),
    sio  = require("socket.io"),
    serverDomain = domain.create();

serverDomain.run(function () {

  var server = http.createServer(function(req, res){
    var fileName = url.parse(req.url).pathname;
    fileName = (fileName == "/") ? defaultFileName : fileName.substring(fileName.lastIndexOf('/')+1);
    fs.readFile(decodeURIComponent(fileName), 'binary',function(err, content){
        if (content != null && content != '' ){
          res.writeHead(200,{'Content-Length':content.length, 'Content-Type': 'text/html'});
          res.write(content);
        }
        res.end();
        if (!err===null){
          return err.message;
        }
        console.log("File requested:"+fileName);
    });

}).listen(process.env.PORT, process.env.IP),

  io = sio.listen(server,{transports:['websocket','htmlfile']});

  io.sockets.on('connection', function (socket) {
    socket.ip = socket.request.connection.remoteAddress;
    socket.emit('serverSendingData', { message: 'CLIENT CONNECTED'});

    socket.on('clientSendingData', function (data) {
      console.log("DATA RECEIVED FROM CLIENT: "+data.message);
      socket.emit('serverSendingData',{message: 'MSG Received: '+data.message+" YOUR IP:"+socket.ip+"SERVER TIME:"+Date()});
      emitter.emit('EaddToDB',addToDB, socket.ip, Date.now(), data.message);
      emitter.emit('dbToCSV',dbToCSV);
      
      console.log("csvData: "+dbDomain.csvData);
    });

    socket.on('clientDBtoCSV', function (data) {
      emitter.emit("dbToCSV",dbToCSV) ;
    });

  });
});

serverDomain.on('error', function (error) {
      console.error('SERVER DOMAIN ERROR:', error);
      serverDomain.dispose();
});