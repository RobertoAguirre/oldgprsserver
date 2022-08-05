//ACTIVAR EXPRESS PARA CONEXION A LA BASE DE DATOS
const express = require('express')
const app = express()

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

var res;

var PORT = 8080;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

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
  var checksum = sumahex.slice(1, 3);

  return checksum;

}

formarComando = function (arrobasCmd, imei, comando, valor, valorExtra, checksum) {
  //@@Q25,861693033989872,A10,*aa

  if (valor !== '') {
    if (valorExtra !== '') {
      var _COMMAND = "@@" + arrobasCmd + "," + imei + "," + comando + "," + valorExtra + "," + valor + "*" + checksum + "\r\n";
    } else {
      var _COMMAND = "@@" + arrobasCmd + "," + imei + "," + comando + "," + valor + "*" + checksum + "\r\n";
    }


  } else {
    var _COMMAND = "@@" + arrobasCmd + "," + imei + "," + comando + "*" + checksum + "\r\n";
  }

  return _COMMAND;
}




//AQUI CONSTRUYO EL SERVIDOR TCP SIMPLE
const net = require('net')

net.createServer(socket => {
  console.log('TCP SERVER escuchando en: 8080');
  socket.on('data', function (data) { //EN ESTA LINEA SE RECIBE LA TRAMA DESDE LOS APARATOS

    var aString = data.toString();
    console.log("recibido: " + aString);
    var partsOfStr = aString.split(',');

    //VERIFICA LA EXISTENCIA DE CLIENTE EN ARREGLO DE SOCKETS

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
        console.log("el socket ya existe");
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
    }


    //ESTRUCTURA DE LA TRAMA
    console.log("Direccion remota: " + remote.address);
    console.log("Puerto remoto: " + remote.port);
    console.log("inicio de trama: " + partsOfStr[0]);
    console.log("IMEI:" + partsOfStr[1]);
    console.log("3 As: " + partsOfStr[2]);
    console.log("numero de mensaje, Event code: " + partsOfStr[3]);
    console.log("latitud: " + partsOfStr[4]);
    console.log("longitud: " + partsOfStr[5]);
    console.log("fecha: " + partsOfStr[6]);
    console.log("Estatus posicionamiento A=valid V=Invalid: " + partsOfStr[7]);
    console.log("Satelies visibles: " + partsOfStr[8]);
    console.log("Fuerza señal GSM: " + partsOfStr[9]);
    console.log("VELOCIDAD ACTUAL:" + partsOfStr[10]);
    console.log("Direccion: " + calculaDireccion(partsOfStr[11]));
    console.log("Posicion horizontal: " + partsOfStr[12]);
    console.log("altitud: " + partsOfStr[13]);
    console.log("millas: " + partsOfStr[14]);
    console.log("tiempo corriendo: " + partsOfStr[15]);
    console.log("base station info: " + partsOfStr[16]);
    console.log("I/0 Port status: " + partsOfStr[17]);
    console.log("Analog input status: " + partsOfStr[18]);
    console.log("unknown: " + partsOfStr[19]);
    console.log("unknown: " + partsOfStr[20]);

    console.log("----------------------------------------");
    var valores_entradas_analogicas = partsOfStr[18].toString();
    console.log("Valores entradas analogicas: " + valores_entradas_analogicas);

    var AD1 = valores_entradas_analogicas.slice(0, 4);
    console.log("AD1:" + AD1);
    var AD2 = valores_entradas_analogicas.slice(5, 9);
    console.log("AD2:" + AD2 + " sensor de combustible");
    var AD3 = valores_entradas_analogicas.slice(10, 14);
    console.log("AD3:" + AD3);
    var AD4 = valores_entradas_analogicas.slice(15, 19);
    console.log("AD4:" + AD4);
    var AD5 = valores_entradas_analogicas.slice(20, 24);
    console.log("AD5:" + AD5);
    console.log("----------------------------------------");
    var fechaF = partsOfStr[6];
    var fechaFormateada = "20" + fechaF;
    var year = fechaFormateada.slice(0, 4);
    var month = fechaFormateada.slice(4, 6);
    var day = fechaFormateada.slice(6, 8);
    var hour = fechaFormateada.slice(8, 10);
    //hour = hour-6;
    var minute = fechaFormateada.slice(10, 12);
    var second = fechaFormateada.slice(12, 14);

    var fechaActual = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    console.log("Fecha actual " + fechaActual);

    var ubicacion = {
      latitud: partsOfStr[4],
      longitud: partsOfStr[5],
      imei: partsOfStr[1],
      velocidad: partsOfStr[10],
      direccion: calculaDireccion(partsOfStr[11]),
      direccionGrados: partsOfStr[11],
      duracion: 0,
      event_code: partsOfStr[3],
      fecha: fechaActual,
      combustible: AD2.toString()
    }

    //consultar la basa de datos y traer resultados
    //var consulta = "GuardaUbicacionOLD "+ubicacion.latitud+","+ubicacion.longitud+","+ubicacion.imei+","+0+","+ubicacion.velocidad+",'"+ubicacion.direccion+"',"+ubicacion.duracion+"";

    //consultar la basa de datos y traer resultados
    var consulta = "GuardaUbicacion " + ubicacion.latitud + "," + ubicacion.longitud + "," + ubicacion.imei + "," + 0 + "," + ubicacion.velocidad + ",'" + ubicacion.direccion + "'," + ubicacion.duracion + "," + ubicacion.event_code + ",'" + ubicacion.fecha + "','" + ubicacion.combustible + "'," + ubicacion.direccionGrados + "";

    var deadpool = new sql.ConnectionPool(config).connect().then(pool => {

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


  })
}).listen(8080)

//fin de servidor tcp


//parte del servidor de pagina web

//var express = require('express');
//var app = express();
//
//arreglo para guardar los clientes confirme se vayan conectando
var clientes = [];

var valoresHex = [];

var suma = 0;


//ESTA ES LA PARTE DEL SERVIDOR WEBSOCKETS
var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ port: 8083 })
console.log('WebSocket escuchando en: 8083');
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('Recibido desde traxtrap: %s', message)
    //if(message === 'test'){

    var recibido = JSON.parse(message);

    //Primero tengo que encontrar el objeto en el arreglo 'clientes' 
    //cuyo valor en la propiedad 'IMEI', sea igual a el mensaje que estoy mandando.
    var encontrado = false;
    for (var i = 0; i < clientes.length; i++) {
      if (clientes[i].IMEI === recibido.imei) {
        encontrado = true;
        var destino = clientes[i];
        var socketDestino = destino.SOCKET;
        if (recibido.valor !== '') {
          if (recibido.valorExtra !== '') {
            var comandoSinChecksum = "@@" + recibido.arrobasCmd + "," + recibido.imei + "," + recibido.comando + "," + recibido.valorExtra + "," + recibido.valor + "*";
          } else {
            var comandoSinChecksum = "@@" + recibido.arrobasCmd + "," + recibido.imei + "," + recibido.comando + "," + recibido.valor + "*";
          }

        } else {
          var comandoSinChecksum = "@@" + recibido.arrobasCmd + "," + recibido.imei + "," + recibido.comando + "*";

        }
        var _checkSum = hexSum(comandoSinChecksum);
        var comandoPorEnviar = formarComando(recibido.arrobasCmd, recibido.imei, recibido.comando, recibido.valor, recibido.valorExtra, _checkSum);
        console.log('Comando por enviar: ' + comandoPorEnviar);
        socketDestino.write(comandoPorEnviar);
        //return wr;
        /* socketDestino.on('data', function (data) {
           //this data is a Buffer object
           var aString = data.toString();
           console.log(aString);
           ws.send(aString);
         });/*
 
       /*  socketDestino.on('error', function (error) {
           //callback(error, null)
           var aError = error.toString();
           console.log(aError);
         });*/

        break;
      }
    }

    /*     var socketDestino = clientes[0];
        socketDestino.write(message); */
    //}
  })
  /* setInterval(
     () => ws.send(`${new Date()}`),
     1000
   )*/
})




