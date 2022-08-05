//parte del servidor de pagina web
//var express = require('express');
//var app = express();
//
//arreglo para guardar los clientes confirme se vayan conectando
var clientes = [];

/*
* express server setup
*/
/* app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.get('/', function (req, res) {
  res.render('controller', {
    title:'utilidades tcp', 
    clients:clientes,
    port: 8080 });
});

app.use(express.static(__dirname + '/public'));
app.listen(8084); */

//ESTA ES LA PARTE DEL SERVIDOR WEBSOCKETS
var WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ port: 8083 })
console.log('WebSocket escuchando en: 8083');
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message)
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
        socketDestino.write(recibido.comando);
        break;
      }
    }

    /*     var socketDestino = clientes[0];
        socketDestino.write(message); */
    //}
  })
  setInterval(
    () => ws.send(`${new Date()}`),
    1000
  )
})

buscarIMEI = function (IMEI) {
  var _found = 0;
  for (var i = 0; i < clientes.length; i++) {
    if (clientes[i].IMEI === IMEI) {
      _found = _found + 1;
      /*           encontrado = true;
            console.log("el socket ya existe");
            socket.destroy();
            console.log("socket destruida");
            break; */
    } else {
      
      /*           console.log("inicio de trama: " + partsOfStr[0]);
            console.log("IMEI:" + partsOfStr[1]);
            var sk = {
              IMEI: partsOfStr[1],
              SOCKET: socket
            }
            clientes.push(sk);
            console.log("cliente pushado"); */
    }
  }

  return _found;

}

  //esta es la parte del servidor tcp
  const net = require('net')



  net.createServer(socket => {
    console.log('Socket escuchando en: 8083');
    socket.on('data', function (data) {
      var aString = data.toString();
      console.log(aString);
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
        if(encontrado > 0){
          console.log("el socket ya existe");
          //socket.destroy();
          //console.log("socket destruido");
  
        }else{
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







      /*     console.log("inicio de trama: " + partsOfStr[0]);
          console.log("IMEI:" + partsOfStr[1]); */
      /*     var sk = {
            IMEI: partsOfStr[1],
            SOCKET: socket
          } */
      /*     console.log(clientes.includes(sk));
          if (clientes.includes(sk)) {
            //console.log("el socket ya existe");
          } else {
            clientes.push(sk);
            console.log("cliente pushado");
          } */
      //con esto mando comandos a los aparatos
      //socket.write(data.toString())
    })
  }).listen(8080)

//fin de servidor tcp