import { Router } from "express";
import productModel from '../models/product.model.js';
import cartModel from '../models/cart.model.js';
//import ProductManager from "../managers/ProductManager.js";


const router = Router();
//const productManager = new ProductManager();

// vista de todos los productos
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
            .limit(limit).lean();
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


        res.render('home' ,{
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
        });


    } catch (error) {
        // manejo de errores
        res.status(500).json({
            status: "error",
            error: "No se encontraron productos",
            details: error.message,
        });
    }
});

// vista de detalle de producto
router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await productModel.findById(productId).lean();

        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productDetails', {
            product: product,
        });

    } catch (error) {
        res.status(500).send('Error al obtener el producto');
    }
});

//vista del carrito 
router.get('/cart/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid).populate('products.product');
        
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const cartItems = cart.products.map(item => ({
            cartId: cid,
            productName: item.product.title,
            productPrice: item.product.price,
            quantity: item.quantity,
            totalPrice: item.product.price * item.quantity,
            productId: item._id.toString()  
        }));

        
        res.render('myCart', {
            cartItems,
            total: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
            cartId: cid  
        });
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).send('Error al obtener el carrito');
    }
});

// vista de productos en tiempo real 
router.get("/realtimeproducts", async (req, res) => {
    const products = await productModel.find(); //productManager.getProducts();
    res.render('realTimeProducts',{
        data: products
    });
});

router.get("/**",async ( req, res) =>{
    res.render('error404');
})

export default router;