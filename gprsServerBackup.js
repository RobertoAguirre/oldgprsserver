//ACTIVAR EXPRESS PARA CONEXION A LA BASE DE DATOS
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require("cors");

var _msg;
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



   
        
        
      






//////////////////AQUI EMPIEZA LO DE LOS SOCKETS////////////////////



//arreglo para guardar los clientes confirme se vayan conectando
var clientes = [];

var valoresHex = [];

var suma = 0;

app.use(bodyParser.json()); //support json encoded bodies
app.use(bodyParser.urlencoded({extended:true})); //support encoded bodies
app.use(cors());



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
      if(socketDestino.destroyed){
        _socketDestinoAnterior = socketDestino;
        socketDestino = new net.Socket();
        socketDestino.remoteAddress= _socketDestinoAnterior.remoteAddress;
        socketDestino.remotePort = _socketDestinoAnterior.remotePort;
        // var aString = data.toString();

        socketDestino.connect(socketDestino.remotePort,socketDestino.remoteAddress)

      }

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
      try{
       // socketDestino.resume();
       // socketDestino.write(comandoPorEnviar);


       var is_kernel_buffer_full = socketDestino.write(comandoPorEnviar, null, (error) => { 

        if(is_kernel_buffer_full){
          console.log("Envio terminado OK", error); 
          //enviarComandoGPRS(recibido);
          if(error !== undefined){
            console.log(error);
          }else{
   
            clientes.splice(i,1);
          }
          console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
        
        }else{
          socketDestino.pause();
        }

 
      });

        // socketDestino.write(comandoPorEnviar, null, (error) => { 
        //   console.log("Envio terminado OK", error); 
        //   if(error !== undefined){
        //     console.log(error);
        //   }else{
   
        //     clientes.splice(i,1);
        //   }
        // });

 

      }catch(err){
        console.log(err);
      }
      

    /*  socketDestino.on('error', function (error) {
        //callback(error, null)
        var aError = error.toString();
        console.log(aError);
      });*/

      break;
    }
  }
}

app.post('/api/SendGPRS', function(req, res) {
  //var imeiRecurso = req.body.imei;
  var message = req.body;
  //var token = req.body.token;
  
  
  //var recibido = JSON.parse(message);
  enviarComandoGPRS(message);
  _msg = message;
  res.send("APIOK");
});




app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var server = app.listen(3002, function () {
    console.log('REST API running at port 3002..');
});



//esta es la parte del servidor tcp
const net = require('net');



net.createServer(socket => {
  console.log('Socket escuchando en: 8090');

  socket.on('drain',function(){
    console.log('write buffer is empty now .. u can resume the writable stream');
    socket.resume();
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
  

 //just added
  socket.on("error", function (err){
    console.log("Caught flash policy server socket error: ");
    console.log(err.stack)
  })

  

  socket.on('data', function (data) {
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
     // enviarComandoGPRS(_msg);
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
        //enviarComandoGPRS(_msg);
      }
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


  

/////
////
// console.log("inicio de trama: "+partsOfStr[0]);
// console.log("IMEI:"+partsOfStr[1]);
// console.log("3 As: "+partsOfStr[2]);
// console.log("numero de mensaje, Event code: "+partsOfStr[3]);
// console.log("latitud: "+partsOfStr[4]);
// console.log("longitud: "+partsOfStr[5]);
// console.log("fecha: "+partsOfStr[6]);
// console.log("Estatus posicionamiento A=valid V=Invalid: "+partsOfStr[7]);
// console.log("Satelies visibles: "+partsOfStr[8]);
// console.log("Fuerza señal GSM: "+partsOfStr[9]);
// console.log("VELOCIDAD ACTUAL:" +partsOfStr[10]);
// console.log("Direccion: "+ calculaDireccion(partsOfStr[11]));
// console.log("Posicion horizontal: "+partsOfStr[12]);
// console.log("altitud: "+partsOfStr[13]);
// console.log("millas: "+partsOfStr[14]);
// console.log("tiempo corriendo: "+partsOfStr[15]);
// console.log("base station info: "+partsOfStr[16]);
// console.log("I/0 Port status: "+partsOfStr[17]);
// console.log("Analog input status: "+partsOfStr[18]);
// console.log("unknown: "+partsOfStr[19]);
// console.log("unknown: "+partsOfStr[20]);

// console.log("----------------------------------------");
// var valores_entradas_analogicas  = partsOfStr[18].toString();
// console.log("Valores entradas analogicas: " + valores_entradas_analogicas);

// var AD1 = valores_entradas_analogicas.slice(0,4);
// console.log("AD1:" + AD1);
// var AD2 = valores_entradas_analogicas.slice(5,9);
// console.log("AD2:" + AD2+" sensor de combustible");
// var AD3 = valores_entradas_analogicas.slice(10,14);
// console.log("AD3:" + AD3);
// var AD4 = valores_entradas_analogicas.slice(15,19);
// console.log("AD4:" + AD4);
// var AD5 = valores_entradas_analogicas.slice(20,24);
// console.log("AD5:" + AD5);
// console.log("----------------------------------------");
var fechaF = partsOfStr[6];
var fechaFormateada =  "20"+fechaF;
var year = fechaFormateada.slice(0,4);
var month = fechaFormateada.slice(4,6);
var day = fechaFormateada.slice(6,8);
var hour = fechaFormateada.slice(8,10);
//hour = hour-6;
var minute = fechaFormateada.slice(10,12);
var second = fechaFormateada.slice(12,14);

var fechaActual = year + "-" +month +"-"+day+" "+hour+":"+minute+":"+second;
console.log("Fecha actual " + fechaActual);	

var ubicacion = {
  latitud:partsOfStr[4],
  longitud:partsOfStr[5],
  imei:partsOfStr[1],
  velocidad:partsOfStr[10],
  direccion:calculaDireccion(partsOfStr[11]),
  direccionGrados:partsOfStr[11],
  duracion:0,
  event_code:partsOfStr[3],
  fecha:fechaActual,
  combustible:'0',
  entradas:partsOfStr[17]
  
    }

    var consulta = "GuardaUbicacion " + ubicacion.latitud + "," + ubicacion.longitud + "," + ubicacion.imei + "," + 0 + "," + ubicacion.velocidad + ",'" + ubicacion.direccion + "'," + ubicacion.duracion + "," + ubicacion.event_code + ",'" + ubicacion.fecha + "','" + ubicacion.combustible + "'," + ubicacion.direccionGrados + ",'"+ubicacion.entradas+"'";

		
		
    var deadpool=new sql.ConnectionPool(config).connect().then(pool => {
  
      return pool.request().query(consulta)
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

////


  })
}).listen(3001)

//fin de servidor tcp

