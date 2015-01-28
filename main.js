// Create exxpres application
var express = require('express');
var app = express();
var http = require('http').Server(app);

var WebSocketServer = require('websocket').server;

// Load cookie parser for express application
var cookieParser = require('cookie-parser');
app.use(cookieParser());

// Load database from .json file
var JsonDB = require('node-json-db');
var db = new JsonDB("usersDatabase", true, true);
var users = db.getData("/users");

app.get('/', function(req, res, next) {
    if(req.cookies.wiCANtoken){
        res.redirect('/workspace.html');
    } else {
        next();
    }
});

// Set folder of public files
app.use(express.static(__dirname + '/public'));

// Login request
app.post('/login', function(req, res) {
    var email = req.query.email;
    var passwd = req.query.passwd;
    
    // console.log("email " + email);
    // console.log("passwd " + passwd);
    
    for(var i = 0; i < users.length; i++) {
        if(users[i].publicData.email === email) {
            if(users[i].passwd === passwd) {
                users[i].expireTime = new Date(Date.now() + 10000000);
                users[i].token = make_token();
                db.push("/users", users);
                res.cookie('wiCANtoken', users[i].token, { expires: users[i].expireTime, httpOnly: true });
                res.send('success');
                res.end();
                return;
            }
        }
    }
    res.send("error");
    res.end();
});

app.post('/logout', function(req, res) {
   res.clearCookie('wiCANtoken');
   res.send("logout");
   res.end;
});

// Register request
app.get("/register", function(req, res) {
    var name = req.query.name;
    var email = req.query.email;
    var passwd = req.query.passwd;
    
    // console.log("New user:");
    // console.log("name " + name);
    // console.log("email " + email);
    // console.log("passwd " + passwd);
    
    for(var i = 0; i < users.length; i++) {
        if(users[i].email === email) {
            res.send("exist");
            res.end();
            return;
        }
    }
    
    // update database
    users.push({
        publicData: {
            name: name,
            email: email,
            projects: []
        },
        passwd: passwd
    });
    db.push("/users", users);
    
    // send respond
    res.send("added");
    res.end();
});

var server = http.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    
    console.log('wiCAN server listening at http://%s:%s', host, port);
});

function make_token()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 50; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// create the server
var wsServer = new WebSocketServer({
    httpServer: http
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection;
    var connectedUser;
    // Log of incoming conection
    // console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    
    parseCookies(request.cookies);
    // console.log(request.cookies.wiCANtoken);
    
    if(request.cookies.wiCANtoken !== undefined) {
        for(var i = 0; i < users.length; i++) {
            if(users[i].token === request.cookies.wiCANtoken) {
                connectedUser = users[i].publicData;
                break;
            }
        }
    }
    
    connection = request.accept(null, request.origin);

    connection.on('message', function(message) {
        if(connectedUser !== undefined){
            if (message.type === 'utf8') {
                var recievedData;
                try {
                    recievedData = JSON.parse(message.utf8Data);
                    
                    switch (recievedData.type) {
                        case 'getUserData':
                            console.log("User get data from database");
                            recievedData.result = connectedUser;
                            connection.send(JSON.stringify(recievedData));
                            break;
                        case 'postUserData':
                            console.log("User post data to database");
                            for(var i = 0; i < users.length; i++) {
                                if(users[i].publicData.email === recievedData.result.email) {
                                    users[i].publicData = recievedData.result;
                                }
                            }
                            db.push("/users", users);
                            recievedData.result = "ok";
                            connection.send(JSON.stringify(recievedData));
                            break;
                        case 'cmd':
                                
                            break;
                        default:
                            console.log("Get a incorrect request: "+ recievedData.type);
                    }
                } catch (e) {
                    console.log('This doesn\'t look like a valid JSON: ', message.utf8Data);
                    return;
                }
            }
        } else {
            connection.close();
        }
    });

    connection.on('close', function(connection) {
        console.log("Connection closed %j", connection);
    });
});

function parseCookies(obj){
  var key;
  var val;

  for (var i = 0; i < obj.length; i++) {
    key = obj[i].name;
    val = obj[i].value;

    if (val) {
      obj[key] = val;
    }
  }

  return obj;
}