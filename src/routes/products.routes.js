import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import { socketServer } from '../app.js';

const router = Router();
const productManager = new ProductManager();

// Ruta GET /
router.get("/", async (req, res) => {

    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = parseInt(offset) || 0;
    
    const products = await productManager.getProducts();
    const paginatedProducts = products.slice(offset, offset + limit);
    
    res.json({
        total: products.length,
        limit,
        offset,
        data: paginatedProducts
    });
});

// Ruta GET /:pid
router.get("/:pid", async (req, res) => {
    
    const { pid } = req.params;
    const product = await productManager.getProductById(parseInt(pid));

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
});

// Ruta POST /
router.post("/new_product", async (req, res) => {
    const productData = req.body;
    if (
        !productData.title ||
        !productData.description ||
        !productData.code ||
        !productData.price ||
        !productData.stock ||
        !productData.category
    ) {
        return res.status(400).json({ error: "Datos incompletos" });
    }

    const newProduct = await productManager.addProduct(productData);
    socketServer.emit('productAdded', newProduct); 
    res.status(201).json(newProduct);
});

// Ruta PUT /:pid
router.put("/:pid", async (req, res) => {
    const { pid } = req.params;
    const updates = req.body;

    try {
        const updatedProduct = await productManager.updateProduct(
            parseInt(pid),
            updates
        );
        res.json(updatedProduct);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// Ruta DELETE /:pid
router.delete("/:pid", async (req, res) => {
    const { pid } = req.params;

    try {
        await productManager.deleteProduct(parseInt(pid));
        socketServer.emit('productDeleted', pid);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

export default router;