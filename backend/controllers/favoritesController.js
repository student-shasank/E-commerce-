// controllers/favoritesController.js

import userModel from "../models/User.js";

// ✅ ADD TO FAVORITES
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // 🔒 secure (JWT se aayega)
    const { productId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ FIX ObjectId compare
    const alreadyFavorite = user.favorites.some(
      (id) => id.toString() === productId
    );

    if (alreadyFavorite) {
      return res.status(400).json({
        message: "Product already in favorites",
      });
    }

    user.favorites.push(productId);
    await user.save();

    res.status(200).json({
      message: "Product added to favorites",
      favorites: user.favorites,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ REMOVE FROM FAVORITES
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const productExists = user.favorites.some(
      (id) => id.toString() === productId
    );

    if (!productExists) {
      return res.status(400).json({
        message: "Product not in favorites",
      });
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      message: "Product removed from favorites",
      favorites: user.favorites,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ GET FAVORITES
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .populate("favorites", "name price imageUrl"); // 🔥 optimized

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      favorites: user.favorites,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};