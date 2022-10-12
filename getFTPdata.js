var Client = require('ftp');

var c = new Client();
c.on('ready',function(){
  console.log("ready");
  c.end();
});

c.connect({host:"sidads.colorado.edu"})