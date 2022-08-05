const express = require('express')
const app = express()

var sql = require("mssql");
//configuración sql
  var config = {
    user:'remoto',
    password: 'remot3',
    server:'74.208.145.99',
	port:50055,
    database:'Transporte'
  }
 
 //configuración sql
 /* var config = {
  user:'remoto',
   password: 'remot3',
    server:'62.151.176.127',
   database:'Transporte'
 }*/
 
  
 var res;


var PORT = 8080;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

function calculaDireccion(direccionGPS){
	if(direccionGPS > 338 && direccionGPS < 23){
		return "N";
	}
	if(direccionGPS >= 23 && direccionGPS < 68){
		return "NE"; 
	} 
	if(direccionGPS >= 68 && direccionGPS < 113){
		return "E"; 
	} 	
	if(direccionGPS >= 113 && direccionGPS < 158){
		return "SE"; 
	} 		
	if(direccionGPS >= 158 && direccionGPS < 203){
		return "S"; 
	}
	if(direccionGPS >= 203 && direccionGPS < 248){
		return "SW"; 
	}  	
	if(direccionGPS >= 248 && direccionGPS < 293){
		return "W"; 
	}
	if(direccionGPS >= 297 && direccionGPS < 338){
		return "NW"; 
	} 	
}

server.on('listening', function () {
    var address = server.address();
    console.log('TEST UDP Server escuchando en  ' + address.address + ":" + address.port);
});

server.on('message', function (message, remote) {
    //console.log(remote.address + ':' + remote.port +' - ' + message);	
	
	var aString = message.toString();
	console.log(aString);
	var partsOfStr = aString.split(',');
	console.log("Direccion remota: "+remote.address);
	console.log("Puerto remoto: " + remote.port);
	console.log("inicio de trama: "+partsOfStr[0]);
	console.log("IMEI:"+partsOfStr[1]);
	console.log("3 As: "+partsOfStr[2]);
	console.log("numero de mensaje, Event code: "+partsOfStr[3]);
	console.log("latitud: "+partsOfStr[4]);
	console.log("longitud: "+partsOfStr[5]);
	console.log("fecha: "+partsOfStr[6]);
	console.log("Estatus posicionamiento A=valid V=Invalid: "+partsOfStr[7]);
	console.log("Satelies visibles: "+partsOfStr[8]);
	console.log("Fuerza señal GSM: "+partsOfStr[9]);
	console.log("VELOCIDAD ACTUAL:" +partsOfStr[10]);
	console.log("Direccion: "+ calculaDireccion(partsOfStr[11]));
	console.log("Posicion horizontal: "+partsOfStr[12]);
	console.log("altitud: "+partsOfStr[13]);
	console.log("millas: "+partsOfStr[14]);
	console.log("tiempo corriendo: "+partsOfStr[15]);
	console.log("base station info: "+partsOfStr[16]);
	console.log("I/0 Port status: "+partsOfStr[17]);
	console.log("Analog input status: "+partsOfStr[18]);
	console.log("unknown: "+partsOfStr[19]);
	console.log("unknown: "+partsOfStr[20]);
	
	console.log("----------------------------------------");
	var valores_entradas_analogicas  = partsOfStr[18].toString();
	console.log("Valores entradas analogicas: " + valores_entradas_analogicas);
	
	var AD1 = valores_entradas_analogicas.slice(0,4);
	console.log("AD1:" + AD1);
	var AD2 = valores_entradas_analogicas.slice(5,9);
	console.log("AD2:" + AD2+" sensor de combustible");
	var AD3 = valores_entradas_analogicas.slice(10,14);
	console.log("AD3:" + AD3);
	var AD4 = valores_entradas_analogicas.slice(15,19);
	console.log("AD4:" + AD4);
	var AD5 = valores_entradas_analogicas.slice(20,24);
	console.log("AD5:" + AD5);
	console.log("----------------------------------------");
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

		
    /*    var ubicacion = {
			latitud:partsOfStr[4],
			longitud:partsOfStr[5],
			imei:partsOfStr[1],
			velocidad:partsOfStr[10],
			direccion:partsOfStr['NA'],
			duracion:0
        }
		
		//consultar la basa de datos y traer resultados
      */
	  
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
			combustible:AD2.toString(),
			entradas:partsOfStr[17]
			
        }
		
		//consultar la basa de datos y traer resultados
        //var consulta = "GuardaUbicacionOLD "+ubicacion.latitud+","+ubicacion.longitud+","+ubicacion.imei+","+0+","+ubicacion.velocidad+",'"+ubicacion.direccion+"',"+ubicacion.duracion+"";
      
	  	//consultar la basa de datos y traer resultados
        //var consulta = "GuardaUbicacion "+ubicacion.latitud+","+ubicacion.longitud+","+ubicacion.imei+","+0+","+ubicacion.velocidad+",'"+ubicacion.direccion+"',"+ubicacion.duracion+","+ubicacion.event_code+",'"+ubicacion.fecha+"','"+ ubicacion.combustible +"',"+ubicacion.direccionGrados+"";
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
	  
	  
	});
    
        //conectarse a la base de datos
        /*sql.connect(config,function(err){
            if(err) console.log(err);
      
            //crea la request
            var request = new sql.Request();
      
            //consultar la basa de datos y traer resultados
            var consulta = "GuardaUbicacion "+ubicacion.latitud+","+ubicacion.longitud+","+ubicacion.imei+","+0+","+ubicacion.velocidad+",'"+ubicacion.direccion+"',"+ubicacion.duracion+"";
      
            request.query(consulta, function(err,recordset){
      
              if(err) console.log(err);
      
              //envia recordset como una response
              //res.send(recordset);
              sql.close();
      
            })
      
          })*/



//server.bind(PORT, HOST);
server.bind(PORT);