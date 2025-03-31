import { Router } from "express";
import { socketServer } from '../app.js';
import productModel from '../models/product.model.js';
//import ProductManager from "../managers/ProductManager.js";

//const productManager = new ProductManager();
const router = Router();

// Ruta GET /
router.get("/", async (req, res) => {

    let { limit, page, query, sort } = req.query;
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;

    try {
        //uso de archivos locales
        //const products = await productManager.getProducts();

        // Construir el objeto de filtro
        const filter = {};
        // Filtro por categoría y disponibilidad
        if (query) {
            if (query.category) {
                filter.category = query.category;
            }
            if (query.stock === "available") {
                filter.stock = { $gt: 0 }; // Productos con stock mayor a 0
            } else if (query.stock === "unavailable") {
                filter.stock = 0; // Productos con stock igual a 0
            }
        }

        // Obtener el total de productos que coinciden con el filtro
        const totalProducts = await productModel.countDocuments(filter);

        // Construir el objeto de ordenamiento
        const sortOptions = {};
        if (sort) {
            if (sort === "asc") {
                sortOptions.price = 1; // Orden ascendente por precio
            } else if (sort === "desc") {
                sortOptions.price = -1; // Orden descendente por precio
            }
        }

        // Calcular el total de páginas
        const totalPages = Math.ceil(totalProducts / limit);

        // Calcular el índice de inicio para la paginación
        const startIndex = (page - 1) * limit;

        // Obtener los productos paginados
        const products = await productModel.find(filter)
            .sort(sortOptions)
            .skip(startIndex)
            .limit(limit);

        // Calcular si existen páginas previas y siguientes
        const hasPrevPage = page > 1;
        const hasNextPage = page < totalPages;

        // Construir los enlaces de paginación
        const prevLink = hasPrevPage
            ? `/api/products?limit=${limit}&page=${page - 1}&query=${JSON.stringify(query)}&sort=${sort || ""}`
            : null;
        const nextLink = hasNextPage
            ? `/api/products?limit=${limit}&page=${page + 1}&query=${JSON.stringify(query)}&sort=${sort || ""}`
            : null;


        const response = {
            status: "success",
            payload: products,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        };

        res.json(response);

    } catch (error) {
        // manejo de errores
        res.status(500).json({
            status: "error",
            error: "No sde encontraron productos",
            details: error.message,
        });
    }
});

// Ruta GET /:pid
router.get("/:pid", async (req, res) => {
    const { pid } = req.params;
    try {
        const product = await productModel.findById(pid); //productManager.getProductById(parseInt(pid));

        if (!prducts) {
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