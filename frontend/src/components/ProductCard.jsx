// components/ProductCard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleFavorite,
  selectIsFavorited,
  selectFavoritesLoading,
} from "../redux/Slice/Favoritesslice";

import "../styles/product.css";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const isFavorited = useSelector((state) =>
    selectIsFavorited(state, product._id)
  );

  const loading = useSelector(selectFavoritesLoading);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo?.token) {
      alert("Please login first");
      return;
    }

    dispatch(toggleFavorite(product._id));
  };

  return (
    <div className="product-card">

      {/* ❤️ Wishlist */}
      <button
        className={`wishlist-btn ${isFavorited ? "active" : ""}`}
        onClick={handleWishlist}
        disabled={loading}
      >
        {isFavorited ? "❤️" : "🤍"}
      </button>

      {/* Image */}
      <img
        src={product.imageUrl || "/placeholder.png"}
        alt={product.name}
        className="product-image"
      />

      {/* Info */}
      <div className="product-info">
        <h3>{product.name}</h3>

        <p className="price">
          ₹{product.price?.toLocaleString("en-IN")}
        </p>

        <Link to={`/product/${product._id}`} className="btn">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;