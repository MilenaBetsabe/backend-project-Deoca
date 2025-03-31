import mongoose from 'mongoose';

const { Schema } = mongoose;

//Definimos el esquema de producto
const productSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    code: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    thumbnails: { 
        type: Array, 
        required: false 
    }
});

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;