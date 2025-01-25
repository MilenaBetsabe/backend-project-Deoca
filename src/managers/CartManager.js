import { promises } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import ProductManager from "../managers/ProductManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cartsFilePath = join(__dirname, '../data/carts.json');

class CartManager {
    
    // Método para leer los carritos desde el archivo JSON
    async readCarts() {
        try {
            const data = await promises.readFile(cartsFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error al leer los carritos:', err);
            return [];
        }
    }

    // Método para escribir los carritos en el archivo JSON
    async writeCarts(carts) {
        try {
            await promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
        } catch (err) {
            console.error('Error al escribir los carritos:', err);
        }
    }

    // Crear un nuevo carrito
    async createCart() {
        const carts = await this.readCarts();
        const newCart = { id: carts.length + 1, products: [] }; // ID autoincremental
        carts.push(newCart);
        await this.writeCarts(carts);
        return newCart;
    }

    // Obtener los productos de un carrito por ID
    async getCartProductsById(cartId) {
        const carts = await this.readCarts();
        const cart = carts.find(c => c.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart.products;
    }

    // Agregar un producto al carrito
    async addProductToCart(cartId, productId) {
        const carts = await this.readCarts();
        const cart = carts.find(c => c.id === cartId);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }

        // Verifica si el producto existe
        if(!ProductManager.existProductById){
            throw new Error('El producto no existe');
        }

        // Verifica si el producto ya está en el carrito
        const existingProduct = cart.products.find(p => p.productId === productId);
        if (existingProduct) {
            existingProduct.quantity += 1; // Aumenta la cantidad si ya existe
        } else {
            cart.products.push({ productId, quantity: 1 }); // Si no existe, lo agrega con cantidad 1
        }

        await this.writeCarts(carts);
        return cart;
    }
}

export default CartManager;
