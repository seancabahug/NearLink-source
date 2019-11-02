const programName = "LocalLink";

let locallinkconfig = require('./locallinkconfig.json');

const { execFile } = require('child_process');
const fs = require('fs');

if(locallinkconfig.alreadyRun){
    console.log(`Welcome to ${programName}! This is the server log. Please wait while the server starts up...`);

    // app.js
    var express = require('express');  
    var app = express();  
    var server = require('http').createServer(app);  
    var io = require('socket.io')(server);
    const { networkInterfaces } = require('os');

    var clientsocket;

    app.use(express.static(__dirname + '/node_modules'));  
    app.get('/', function(req, res,next) {  
        if(typeof(clientsocket) != "undefined"){
            res.sendFile(__dirname + '/gamepadPages/index.html');
        }else{
            res.sendFile(__dirname + '/gamepadPages/pleasewait.html');
        }
    });
    app.get('/nipplejs.js', function(req, res,next) {  
        res.sendFile(__dirname + '/node_modules/nipplejs/dist/nipplejs.js');
    });

    const getLocalExternalIP = () => [].concat(...Object.values(networkInterfaces()))
    .filter(details => details.family === 'IPv4' && !details.internal)
    .pop().address;

    io.on('connection', function(client) {

        client.on('clientconnect', function(data) {
            if(data == "iamclient" && client.request.connection.remoteAddress == "::1"){
                if(typeof(clientsocket) == "undefined"){
                    console.log(`\nServer initialization complete! You can now minimize this, take your phone, and go to this website (make sure you're on the same network as this computer!):\n\n${getLocalExternalIP()}:14178\n\nIf you have problems, try using Chrome or making sure you're on the same network.`);
                }
                clientsocket = client;
            }
        });

        client.on('buttondown', (data) => {
            clientsocket.emit("buttondown", {controllerid: data.controllerid, buttonid: data.buttonid});
        });

        client.on('buttonup', (data) => {
            clientsocket.emit("buttonup", {controllerid: data.controllerid, buttonid: data.buttonid});
        });

        client.on('setaxis', (data) => {
            clientsocket.emit("setaxis", {value: data.value, controllerid: data.controllerid, axis: data.axis});
        });
    });

    server.listen(14178, () => {
        console.log("Server is 50% initialized...");
        const { execFile } = require('child_process');
        const child = execFile('./controllerServer/controllerServer.exe', (error, stdout, stderr) => {
            if (error) {
                throw error;
            }
        });
    });
} else {
    console.log("Looks like you're running this for the first time! We'll need to set up a few things; just hang tight. This window will automatically close once setup is finished.");
    const child = execFile('./vjoysetupfiles/vJoySetup.exe', (error, stdout, stderr) => {
        if (error) {
            throw error;
        }
        console.log("Running vJoy Installer...");
    });
    console.log("Once installation is finished, you can close this and reopen the server.");
    locallinkconfig.alreadyRun = true;
    fs.writeFileSync('locallinkconfig.json', JSON.stringify(locallinkconfig));
}