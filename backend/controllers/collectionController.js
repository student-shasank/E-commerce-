import Collection from "../models/Collection.js";


// ✅ CREATE COLLECTION (ADMIN)
export const createCollection = async (req, res) => {
  try {
    const { name, products } = req.body;

    const collection = new Collection({
      name,
      products,
    });

    const saved = await collection.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET ALL COLLECTIONS
export const getCollections = async (req, res) => {
  try {
    const collections = await Collection.find().populate("products");

    res.json(collections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET SINGLE COLLECTION
export const getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id).populate("products");

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ DELETE COLLECTION
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    await collection.deleteOne();

    res.json({ message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ UPDATE COLLECTION
export const updateCollection = async (req, res) => {
  try {
    const { name, products } = req.body;

    const collection = await Collection.findById(req.params.id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    collection.name = name || collection.name;
    collection.products = products || collection.products;

    const updated = await collection.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};