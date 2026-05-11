import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
  selectIsFavorited,
} from '../redux/Slice/Favoritesslice';

/**
 * Custom hook for managing user's favorite products
 * 
 * @returns {Object} - favoritesFunctions and state
 * 
 * @example
 * const { toggleFavorite, isFavorited, favorites, loading } = useFavorites(userId);
 * 
 * <button onClick={() => toggleFavorite(productId)}>
 *   {isFavorited(productId) ? '❤️' : '🤍'}
 * </button>
 */
export const useFavorites = (userId) => {
  const dispatch = useDispatch();

  // Selectors
  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);

  // Get is favorited for a specific product
  const isFavorited = useCallback(
    (productId) => {
      return favorites.some(fav => fav._id === productId || fav === productId);
    },
    [favorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    (productId) => {
      if (!userId) {
        console.warn('User ID is required to toggle favorites');
        return;
      }

      if (isFavorited(productId)) {
        dispatch(removeFromFavorites({ userId, productId }));
      } else {
        dispatch(addToFavorites({ userId, productId }));
      }
    },
    [userId, isFavorited, dispatch]
  );

  // Add to favorites
  const addToFav = useCallback(
    (productId) => {
      if (!userId) {
        console.warn('User ID is required');
        return;
      }
      dispatch(addToFavorites({ userId, productId }));
    },
    [userId, dispatch]
  );

  // Remove from favorites
  const removeFromFav = useCallback(
    (productId) => {
      if (!userId) {
        console.warn('User ID is required');
        return;
      }
      dispatch(removeFromFavorites({ userId, productId }));
    },
    [userId, dispatch]
  );

  // Fetch all favorites
  const fetchFavorites = useCallback(() => {
    if (!userId) {
      console.warn('User ID is required');
      return;
    }
    dispatch(getFavorites(userId));
  }, [userId, dispatch]);

  // Check if any products are favorited
  const hasFavorites = favorites.length > 0;

  // Get count of favorites
  const favoritesCount = favorites.length;

  return {
    // Functions
    toggleFavorite,
    addToFav,
    removeFromFav,
    isFavorited,
    fetchFavorites,

    // State
    favorites,
    loading,
    error,
    hasFavorites,
    favoritesCount,
  };
};

export default useFavorites;