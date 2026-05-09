import express from "express";

import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
} from "../controllers/favoritesController.js";

const router = express.Router();

router.post("/add", addToFavorites);

router.post("/remove", removeFromFavorites);

router.post("/get", getFavorites);

export default router;