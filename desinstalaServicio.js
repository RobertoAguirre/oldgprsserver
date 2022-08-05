
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'GPS_UDP server',
  description: 'Servidor que recibe los datos de los GPSs',
  script: 'D:\\FTP\\GPRSServer\\gprsServer.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists:',svc.exists);
});

svc.uninstall();