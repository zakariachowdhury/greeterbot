var fs = require("fs");

function log(msg) { 
    console.log(new Date().toString() + ' - ' + msg); 
}

function loadConfig() {
    return JSON.parse(fs.readFileSync("config.json"))
}

function getRandomIndex(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

 module.exports = {
   log: log,
   loadConfig: loadConfig,
   getRandomIndex: getRandomIndex
 }
