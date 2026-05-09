import mongoose from "mongoose";

const CollectionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    product: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }]
});

export default mongoose.model("Collection", CollectionSchema);