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
router.post('/:cid/product', async (req, res) => {
    const { cid } = req.params;
    const { productId, quantity } = req.body;

    // Validación de productId
    if (!productId || typeof productId !== 'string') {
        return res.status(400).json({ error: 'ID de producto no proporcionado o inválido' });
    }

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ error: 'ID de producto debe ser un ObjectId válido (24 caracteres hexadecimales)' });
    }

    const quantityNumber = Number(quantity);
    if (isNaN(quantityNumber) || quantityNumber < 1) {
        return res.status(400).json({ error: 'La cantidad debe ser un número mayor a 0' });
    }

    try {
        const productoIdObj = mongoose.Types.ObjectId.createFromHexString(productId);

        let cart;
        
        if (mongoose.isValidObjectId(cid)) {
            cart = await cartModel.findById(cid);
            console.log("Carrito encontrado:", cart);
        }

        // Si no existe el carrito (ya sea por ID inválido o no encontrado)
        if (!cart) {
            // Crear nuevo carrito
            cart = new cartModel({
                ...(mongoose.isValidObjectId(cid) && { _id: cid }),
                products: []
            });
            console.log("Nuevo carrito creado:", cart);
        }

        // Buscar producto en el carrito
        const existingProduct = cart.products.find(p => p.product.equals(productoIdObj));

        if (existingProduct) {
            existingProduct.quantity += quantityNumber;
        } else {
            cart.products.push({
                product: productoIdObj,
                quantity: quantityNumber
            });
        }

        // Guardar cambios
        await cart.save();

        return res.status(200).json({
            status: 'success',
            message: 'Producto agregado al carrito',
            cart
        });

    } catch (error) {
        console.error('Error en addToCart:', error);
        return res.status(500).json({ 
            error: 'Error al agregar el producto al carrito',
            details: error.message,
        });
    }
});

//Actualiza el carrito con un arreglo de productos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;
    try {
        const cart = await cartModel.findById(cid);
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

//Eliminar un producto del carrito 
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    
    try {
        if (!mongoose.isValidObjectId(cid) || !mongoose.isValidObjectId(pid)) {
            return res.status(400).json({ 
                status: 'error',
                message: 'ID inválido' 
            });
        }

        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Carrito no encontrado' 
            });
        }

        const productObjId = new mongoose.Types.ObjectId(pid);
        
        cart.products = cart.products.filter(product => 
            !product._id.equals(productObjId)
        );

        await cart.save();

        return res.status(200).json({
            status: 'success',
            message: 'Producto eliminado del carrito',
            cart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Error al eliminar el producto del carrito',
            error: error.message 
        });
    }
});

//Actualiza la cantidades de un producto en el carrito 
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ 
            status: 'error',
            message: 'La cantidad debe ser un número mayor a 0' 
        });
    }

    try {

        const updatedCart = await cartModel.findOneAndUpdate(
            { 
                _id: cid, 
                'products.product': pid 
            },
            { 
                $set: { 'products.$.quantity': quantity } 
            },
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedCart) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Carrito o producto no encontrado' 
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cantidad del producto actualizada',
            cart: updatedCart
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error al actualizar la cantidad del producto' 
        });
    }
});

export default router;
