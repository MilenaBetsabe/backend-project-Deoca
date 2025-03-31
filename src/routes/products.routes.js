import { Router } from "express";
import { socketServer } from '../app.js';
import productModel from '../models/product.model.js';
//import ProductManager from "../managers/ProductManager.js";

//const productManager = new ProductManager();
const router = Router();

// Devolucion de los productos
router.get("/", async (req, res) => {

    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = parseInt(offset) || 0;
    
    const products = await productModel.find(); //productManager.getProducts();
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
    try {
        const product = await productModel.findById(pid); //productManager.getProductById(parseInt(pid));

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Ruta POST /
router.post("/new_product", async (req, res) => {

    const productData = req.body;
    try {
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
        const newProduct = new productModel(productData); //await productManager.addProduct(productData);
        await newProduct.save();
        socketServer.emit('productAdded', newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el producto' })
    }


});

// Ruta PUT /:pid
router.put("/:pid", async (req, res) => {
    const { pid } = req.params;
    const updates = req.body;

    try {
        const updatedProduct = await productModel.findByIdAndUpdate(pid, updates, { new: true });
        //productManager.updateProduct(parseInt(pid), updates );
        if (!product) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        res.json({ status: "success", message: "Producto actualizado con éxito", updatedProduct });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al actualizar el producto", error: error.message });
    }
});

// Ruta DELETE /:pid
router.delete("/:pid", async (req, res) => {
    const { pid } = req.params;

    try {

        const productDelete = await productModel.findByIdAndDelete(pid);//productManager.deleteProduct(parseInt(pid));
        if (!productDelete) return res.status(404).json({ status: "error", message: "Producto no encontrado" });
        socketServer.emit('productDeleted', pid);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
    }
});

export default router;