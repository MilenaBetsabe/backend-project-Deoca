import { Router } from 'express';
import cartModel from '../models/cart.model.js';
import mongoose from 'mongoose';
//import CartManager from '../managers/CartManager.js'; // Importamos el CartManager

//const cartManager = new CartManager(); // Instanciamos CartManager
const router = Router();

/* Endpoints para manejo de data local
// Crear un carrito nuevo
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart); // Respondemos con el carrito creado
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const updatedCart = await cartManager.addProductToCart(Number(cid), Number(pid));
        res.json(updatedCart); // Respondemos con el carrito actualizado
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});
*/

// Obtener los productos de un carrito por su ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate('products.product');//cartManager.getCartProductsById(Number(cid));
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.status(200).send(cart);  // Respondemos con el carrito
    } catch (error) {
        res.status(500).json({ error: 'Carrito no encontrado' });
    }
});

//Agregar un producto al carrito
router.post('/:cid/products', async (req, res) => {
    const { cid } = req.params;
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).send('La cantidad debe ser mayor a 0');
    }

    try {
        let cart = await cartModel.findById(cid).populate('products.product');
        if (!cart) {
            cart = new cartModel({ products: [] });
            await cart.save();
        }

        const quantityNumber = Number(quantity);
        const productoIdObj = new mongoose.Types.ObjectId(productId);
        const productIndex = cart.products.findIndex(p => p.product.equals(productoIdObj));

        if (productIndex !== -1) {

            cart.products[productIndex].quantity += quantityNumber;
        } else {

            cart.products.push({ product: productoIdObj, quantity: quantityNumber });
        }

        await cart.save();

        res.redirect(`/carrito/${cart._id}`);
    } catch (error) {
        res.status(500).send('Error al agregar el producto al carrito');
    }
});


router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }


        cart.products = products.map(item => ({
            product: item.product,
            quantity: Number(item.quantity)
        }));


        await cart.save();

        res.status(200).send(cart);
    } catch (error) {
        res.status(500).send('Error al actualizar el carrito');
    }
});

//Elimina del carrito todos los productos
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        cart.products = [];
        await cart.save();

        res.status(200).send(cart);  // Responder con el carrito vacío
    } catch (error) {
        res.status(500).send('Error al vaciar el carrito');
    }
});

export default router;
