import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {

    let { limit, offset } = req.query;
    limit = parseInt(limit) || 10;
    offset = parseInt(offset) || 0;
    
    const products = await productManager.getProducts();
    const paginatedProducts = products.slice(offset, offset + limit);
    
    res.render('home', {
        total: products.length,
        limit,
        offset,
        data: paginatedProducts
    });
});

router.get("/realtimeproducts", async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts',{
        data: products
    });
});

router.get("/**",async ( req, res) =>{
    res.render('error404');
})

export default router;