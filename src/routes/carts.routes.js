import { Router } from 'express';
import CartManager from '../managers/CartManager.js'; // Importamos el CartManager

const router = Router();
const cartManager = new CartManager(); // Instanciamos CartManager

// Crear un carrito nuevo
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart); // Respondemos con el carrito creado
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// Obtener los productos de un carrito por su ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const products = await cartManager.getCartProductsById(Number(cid));
        res.json(products); // Respondemos con los productos del carrito
    } catch (error) {
        res.status(404).json({ error: 'Carrito no encontrado' });
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

export default router;
