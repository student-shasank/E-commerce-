import userModel from "../models/User.js";

const addToFavorites = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFavorite = user.favorites.includes(productId);

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
    res.status(500).json({
      message: error.message,
    });
  }
};

const removeFromFavorites = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const productExists = user.favorites.includes(productId);

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
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel
      .findById(userId)
      .populate("favorites");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      favorites: user.favorites,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
};