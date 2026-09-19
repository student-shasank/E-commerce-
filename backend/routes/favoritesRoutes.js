// routes/favoritesRoutes.js

import express from "express";
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../controllers/favoritesController.js";

import {protect} from "../middleware/authMiddleware.js"; // 🔒 must

const router = express.Router();

router.post("/add", protect, addToFavorites);
router.post("/remove", protect, removeFromFavorites);
router.post("/get", protect, getFavorites);

export default router;