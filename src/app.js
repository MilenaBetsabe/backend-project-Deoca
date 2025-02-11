import express, { json } from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import { Server } from 'socket.io';

//Rutas
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';
import viewsRouter from './routes/views.routes.js';

const app = express();
const PORT = 8080;
const httpServer = app.listen(PORT, () => console.log("Listening on port " + PORT));

//inicializamos el motor de plantillas
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

//Cargamos la carpeta 'public' como nuestra carpeta de archivos estáticos
app.use(express.static(__dirname + '/public'));

// Para poder recibir JSONs en los cuerpos de las peticiones
app.use(json());

// Rutas para productos y carritos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

//consulta de funcionamiento de servidor a la ruta "/"
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

//Creamos un servidor de sockets que vive dentro de nuestro servidor HTTP
const socketServer = new Server(httpServer);

const messages = [];

socketServer.on('connection', (socket) => {

    console.log("Nuevo cliente conectado");

    socket.on('message', data => {
        console.log(data);
    });

    socket.emit('evento_para_socket_individual', "Este mensaje solo lo debe recibir el socket");

    socket.broadcast.emit('evento_para_todos_menos_el_socket_actual', "Este envento lo verán todos los sockets conectados menos el socket actual desde el que se envío el mensaje");

    socketServer.emit('evento_para_todos', 'Este mensaje lo reciben todos los sockets conectados');

    socket.emit('loadMessages', messages);

    socket.on('newMessage', (message) => {
        const newMessage = { socketid: socket.id, message };
        messages.push(newMessage);
        socketServer.emit('newMessage', newMessage);
    });
});
export { socketServer };  