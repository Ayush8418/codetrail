import mongoose from 'mongoose';

export interface IProduct {
    name: string;
    price: number;
    ingredients: string[];
}

const ProductSchema = new mongoose.Schema<IProduct>({
    name: { type: String, required: true, trim: true, unique: true },
    price: { type: Number, required: true },
    ingredients: { type: [String], required: true }
});

const ProductModel = (mongoose.models.Product as mongoose.Model<IProduct>) || (mongoose.model<IProduct>('Product', ProductSchema));

export default ProductModel;
