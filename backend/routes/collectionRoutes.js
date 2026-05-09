import express from "express";
import {
  createCollection,
  getCollections,
  getCollectionById,
  deleteCollection,
  updateCollection,
} from "../controllers/collectionController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getCollections)
  .post(protect, admin, createCollection);

router
  .route("/:id")
  .get(getCollectionById)
  .put(protect, admin, updateCollection)
  .delete(protect, admin, deleteCollection);

export default router;