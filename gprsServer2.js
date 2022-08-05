//ACTIVAR EXPRESS PARA CONEXION A LA BASE DE DATOS
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require("cors");
const net = require('net');

//CONFIGURACIÓN DE CONEXIÓN A LA BASE DE DATOS
var sql = require("mssql");
//configuración sql
var config = {
  user: 'remoto',
  password: 'remot3',
  server: '74.208.145.99',
  port: 50055,
  database: 'Transporte'
}

////////////////////////////////////////////////////////////////////////////////////
//////FUNCIONES DE LA REST API//////////////////////////////////////

app.use(bodyParser.json()); //support json encoded bodies
app.use(bodyParser.urlencoded({extended:true})); //support encoded bodies
app.use(cors());
app.post('/api/SendGPRS', function(req, res) {
    //var imeiRecurso = req.body.imei;
    var message = req.body;
    //var token = req.body.token;
    
    
    //var recibido = JSON.parse(message);
    enviarComandoGPRS(message);
    res.send("APIOK");
  
  });
  
  
  
  
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  var server = app.listen(8093, function () {
      console.log('REST API running at port 8093..');
  });


///////////////////////////////////////////////////////////////////















///////////////////////////////////////////////////////////////////////
/////funciones de logica /////////////////////////////////
function calculaDireccion(direccionGPS) {
    if (direccionGPS > 338 && direccionGPS < 23) {
      return "N";
    }
    if (direccionGPS >= 23 && direccionGPS < 68) {
      return "NE";
    }
    if (direccionGPS >= 68 && direccionGPS < 113) {
      return "E";
    }
    if (direccionGPS >= 113 && direccionGPS < 158) {
      return "SE";
    }
    if (direccionGPS >= 158 && direccionGPS < 203) {
      return "S";
    }
    if (direccionGPS >= 203 && direccionGPS < 248) {
      return "SW";
    }
    if (direccionGPS >= 248 && direccionGPS < 293) {
      return "W";
    }
    if (direccionGPS >= 297 && direccionGPS < 338) {
      return "NW";
    }
  }

  formarComando = function(arrobasCmd,imei,comando,valor,valorExtra,checksum)
  {
  //@@Q25,861693033989872,A10,*aa
  
  if(valor !== ''){
    if(valorExtra !== ''){
      var _COMMAND =  "@@"+arrobasCmd+","+imei+","+comando+","+valorExtra+","+valor+"*"+checksum+"\r\n";
    }else{
      var _COMMAND =  "@@"+arrobasCmd+","+imei+","+comando+","+valor+"*"+checksum+"\r\n";
    }


    }else{
      var _COMMAND = "@@"+arrobasCmd+","+imei+","+comando+"*"+checksum+"\r\n";
    }
  
    return _COMMAND;
  }

  buscarIMEI = function (IMEI) {
    var _found = 0;
    for (var i = 0; i < clientes.length; i++) {
      if (clientes[i].IMEI === IMEI) {
        _found = _found + 1;
  
      } else {
  
  
      }
    }
  
    return _found;
  
  }
  
  //convertir el string a ascii hex
  function hexEncode(str) {
    var hex, i;
  
    var result = "";
    for (i = 0; i < str.length; i++) {
      hex = str.charCodeAt(i).toString(16);
      result += (' ' + hex).slice(-4);
      valoresHex.push(hex);
    }
    /*          var a = parseInt('4A',16);
      alert(a); */
    return result;
  }
  
  //sumar valores hexadecimales y regresa la checksum
  function hexSum(texto) {
    suma = 0;
    valoresHex = [];
    var resultado = hexEncode(texto);
    //document.getElementById("txtResultado").value = resultado.toUpperCase();
    //var a = parseInt('4A',16);
    for (i = 0; i < valoresHex.length; i++) {
      var x = parseInt(valoresHex[i], 16);
      suma = suma + x;
  
  
    }
  
    var sumahex = suma.toString(16);
    var checksum = sumahex.slice(1,3);
  
    return checksum;
  
  }

  enviarComandoGPRS = function(recibido){
    let encontrado = false;
    for (var i = 0; i < clientes.length; i++) {
      if (clientes[i].IMEI === recibido.imei) {
        encontrado = true;
        var destino = clientes[i];
        var socketDestino = destino.SOCKET;

  
        if(recibido.valor !== ''){
          if(recibido.valorExtra !==''){
            var comandoSinChecksum = "@@"+recibido.arrobasCmd+","+recibido.imei+","+recibido.comando+","+recibido.valorExtra+","+recibido.valor+"*";
          }else{
            var comandoSinChecksum = "@@"+recibido.arrobasCmd+","+recibido.imei+","+recibido.comando+","+recibido.valor+"*";
          }
          
        }else{
          var comandoSinChecksum = "@@"+recibido.arrobasCmd+","+recibido.imei+","+recibido.comando+"*";
    
        }
        var _checkSum = hexSum(comandoSinChecksum);
        var comandoPorEnviar = formarComando(recibido.arrobasCmd,recibido.imei,recibido.comando,recibido.valor,recibido.valorExtra,_checkSum);
        console.log('Comando por enviar: ' + comandoPorEnviar);
        
         // socketDestino.resume();
         // socketDestino.write(comandoPorEnviar);

           //echo data
          var is_kernel_buffer_full = socketDestino.write(comandoPorEnviar);
          if(is_kernel_buffer_full){
            console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
          }else{
            socket.pause();
          }

        //   socketDestino.write(comandoPorEnviar, null, (error) => { 
        //     console.log("Envio terminado OK", error); 
        //     if(error !== undefined){
        //       console.log(error);
        //     }else{
        //      // socketDestino.end();
        //     //  clientes.splice(i,1);
        //     }
        //   });
  
   
        //     //           var destino = clientes[i];
        //     //           var socketDestino = destino.SOCKET;
        //     //           clientes.splice(i,1)
            
        //     //           ws.close();
        //     //         }
  
        //   //socketDestino.end();
        // }catch(err){
        //   console.log(err);
        // }
        
  
      /*  socketDestino.on('error', function (error) {
          //callback(error, null)
          var aError = error.toString();
          console.log(aError);
        });*/
  
        break;
      }
      }
  }



//////////////////////////////////////////////////////////////////
////AQI EMPIEZA EL SERVIDOR DE SOCKETS TCP ////////////////////////
var clientes = [];

var valoresHex = [];

var suma = 0;
// creates the server
var server = net.createServer();

//emitted when server closes ...not emitted until all connections closes.
server.on('close',function(){
  console.log('Server closed !');
});

// emitted when new client connects
server.on('connection',function(socket){

//this property shows the number of characters currently buffered to be written. (Number of characters is approximately equal to the number of bytes to be written, but the buffer may contain strings, and the strings are lazily encoded, so the exact number of bytes is not known.)
//Users who experience large or growing bufferSize should attempt to "throttle" the data flows in their program with pause() and resume().

  console.log('Buffer size : ' + socket.bufferSize);

  console.log('---------server details -----------------');

  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port' + port);
  console.log('Server ip :' + ipaddr);
  console.log('Server is IP4/IP6 : ' + family);

  var lport = socket.localPort;
  var laddr = socket.localAddress;
  console.log('Server is listening at LOCAL port' + lport);
  console.log('Server LOCAL ip :' + laddr);

  console.log('------------remote client info --------------');

  var rport = socket.remotePort;
  var raddr = socket.remoteAddress;
  var rfamily = socket.remoteFamily;

  console.log('REMOTE Socket is listening at port' + rport);
  console.log('REMOTE Socket ip :' + raddr);
  console.log('REMOTE Socket is IP4/IP6 : ' + rfamily);

  console.log('--------------------------------------------')
//var no_of_connections =  server.getConnections(); // sychronous version
server.getConnections(function(error,count){
  console.log('Number of concurrent connections to the server : ' + count);
});

socket.setEncoding('utf8');

socket.setTimeout(800000,function(){
  // called after timeout -> same as socket.on('timeout')
  // it just tells that soket timed out => its ur job to end or destroy the socket.
  // socket.end() vs socket.destroy() => end allows us to send final data and allows some i/o activity to finish before destroying the socket
  // whereas destroy kills the socket immediately irrespective of whether any i/o operation is goin on or not...force destry takes place
  console.log('Socket timed out');
});


socket.on('data',function(data){
//   var bread = socket.bytesRead;
//   var bwrite = socket.bytesWritten;
//   console.log('Bytes read : ' + bread);
//   console.log('Bytes written : ' + bwrite);
  console.log('Data sent to server : ' + data);
  var aString = data.toString();
  console.log("recibido: " +aString);
  var partsOfStr = aString.split(',');
  if (clientes.length < 1) {
    var sk = {
      IMEI: partsOfStr[1],
      SOCKET: socket
    }
    clientes.push(sk);
    console.log("primer cliente pushado");
  } else {
    //checar si el IMEI ya existe
    var encontrado = false;
    encontrado = buscarIMEI(partsOfStr[1]);
    if (encontrado > 0) {
      //console.log("el socket ya existe");
      //socket.destroy();
      //console.log("socket destruido");

    } else {
      console.log("inicio de trama: " + partsOfStr[0]);
      console.log("IMEI:" + partsOfStr[1]);
      var sk = {
        IMEI: partsOfStr[1],
        SOCKET: socket
      }
      clientes.push(sk);
      console.log("cliente pushado");
    }

    try{

  
  
        let _fechaF = partsOfStr[6];
        let _fechaFormateada =  "20"+_fechaF;
        let _year = _fechaFormateada.slice(0,4);
        let _month = _fechaFormateada.slice(4,6);
        let _day = _fechaFormateada.slice(6,8);
        let _hour = _fechaFormateada.slice(8,10);
        //hour = hour-6;
        let _minute = _fechaFormateada.slice(10,12);
        let _second = _fechaFormateada.slice(12,14);
    
        let _fechaActual = _year + "-" +_month +"-"+_day+" "+_hour+":"+_minute+":"+_second;
    
        if(partsOfStr[3] === "1"){
          console.log("PANIC PRESSED!!");
          let _consulta = "GuardaIncidente " + parseInt(partsOfStr[3]) + "," + 0 + "," + '"boton"' + "," + partsOfStr[1] + "," + partsOfStr[4] + "," + partsOfStr[5] + ",'"+ _fechaActual +"'";
    
        
        
          new sql.ConnectionPool(config).connect().then(pool => {
        
            return pool.request().query(_consulta)
            }).then(result => {
            //let rows = result.recordset
            //res.setHeader('Access-Control-Allow-Origin', '*')
            //res.status(200).json(rows);
            sql.close();
            }).catch(err => {
            //res.status(500).send({ message: "${err}"})
            
            //sql.close();
            //deadpool.close();
            
            });
        }
  
          
        if(partsOfStr[3] === "2"){
          console.log("ALERT PRESSED!!");
          let _consulta = "GuardaIncidente " + parseInt(partsOfStr[3]) + "," + 0 + "," + '"boton"' + "," + partsOfStr[1] + "," + partsOfStr[4] + "," + partsOfStr[5] + ",'"+ _fechaActual +"'";
    
        
        
          new sql.ConnectionPool(config).connect().then(pool => {
        
            return pool.request().query(_consulta)
            }).then(result => {
            //let rows = result.recordset
            //res.setHeader('Access-Control-Allow-Origin', '*')
            //res.status(200).json(rows);
            sql.close();
            }).catch(err => {
            //res.status(500).send({ message: "${err}"})
            
            //sql.close();
            //deadpool.close();
            
            });
        }
          
      }catch(err){
  
      }
}

  //echo data
  var is_kernel_buffer_full = socket.write('Data ::' + data);
  if(is_kernel_buffer_full){
    console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
  }else{
    socket.pause();
  }

});

socket.on('drain',function(){
  console.log('write buffer is empty now .. u can resume the writable stream');
  socket.resume();
});

socket.on('error',function(error){
  console.log('Error : ' + error);
});

socket.on('timeout',function(){
  console.log('Socket timed out !');
  socket.end('Timed out!');
  // can call socket.destroy() here too.
});

socket.on('end',function(data){
  console.log('Socket ended from other end!');
  console.log('End data : ' + data);
});

socket.on('close',function(error){
  var bread = socket.bytesRead;
  var bwrite = socket.bytesWritten;
  console.log('Bytes read : ' + bread);
  console.log('Bytes written : ' + bwrite);
  console.log('Socket closed!');
  if(error){
    console.log('Socket was closed coz of transmission error');
  }
}); 

setTimeout(function(){
  var isdestroyed = socket.destroyed;
  console.log('Socket destroyed:' + isdestroyed);
  socket.destroy();
},1200000);

});

// emits when any error occurs -> calls closed event immediately after this.
server.on('error',function(error){
  console.log('Error: ' + error);
});

//emits when server is bound with server.listen
server.on('listening',function(){
  console.log('Server is listening!');
});

server.maxConnections = 10;

//static port allocation
server.listen(8090);


// for dyanmic port allocation
server.listen(function(){
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('Server is listening at port' + port);
  console.log('Server ip :' + ipaddr);
  console.log('Server is IP4/IP6 : ' + family);
});



var islistening = server.listening;

if(islistening){
  console.log('Server is listening');
}else{
  console.log('Server is not listening');
}

setTimeout(function(){
  server.close();
},5000000);
