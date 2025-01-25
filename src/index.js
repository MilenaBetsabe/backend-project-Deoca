import express, { json } from 'express';

const app = express();
const PORT = 8080;

//Rutas
import productsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js';

app.use(json()); // Para poder recibir JSONs en los cuerpos de las peticiones


// Rutas para productos y carritos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

//consulta de funcionamiento de servidor a la ruta "/"
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente!');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
