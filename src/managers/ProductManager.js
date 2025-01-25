import { promises } from "fs";
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const productsFilePath = join(__dirname, "../data/products.json");

class ProductManager {

    async getProducts() {
        try {
            const data = await promises.readFile(productsFilePath, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Error reading products file:", error);
            return [];
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find((product) => product.id === id);
    }
    
    async existProductById(id) {
        const products = await this.getProducts();
        return products.some((product) => product.id === id);
    }

    async addProduct(product) {
        const products = await this.getProducts();
        const newId = products.length ? products[products.length - 1].id + 1 : 1;
        const newProduct = { id: newId, ...product };
        products.push(newProduct);

        await promises.writeFile(
            productsFilePath,
            JSON.stringify(products, null, 2)
        );
        return newProduct;
    }

    async updateProduct(id, updates) {
        const products = await this.getProducts();
        const productIndex = products.findIndex((product) => product.id === id);

        if (productIndex === -1) {
            throw new Error("Product not found");
        }

        products[productIndex] = { ...products[productIndex], ...updates };
        await promises.writeFile(
            productsFilePath,
            JSON.stringify(products, null, 2)
        );
        return products[productIndex];
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const filteredProducts = products.filter((product) => product.id !== id);

        if (products.length === filteredProducts.length) {
            throw new Error("Product not found");
        }

        await promises.writeFile(
            productsFilePath,
            JSON.stringify(filteredProducts, null, 2)
        );
        return true;
    }
}

export default ProductManager;
