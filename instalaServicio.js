var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'GPRS server',
  description: 'Servidor que recibe los datos de los GPSs por gprs',
  script: 'D:\\FTP\\GPRSServer\\gprsServer.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();