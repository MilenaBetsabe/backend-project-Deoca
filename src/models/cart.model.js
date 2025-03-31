import mongoose from 'mongoose';

const { Schema } = mongoose;

//Definimos el esquema de cart
const cartSchema = new Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]
});

const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel;