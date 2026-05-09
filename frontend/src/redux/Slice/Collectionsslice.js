// ============================================
// 🚀 UPGRADED collectionsSlice.js
// ============================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ================= THUNKS WITH ADVANCED ERROR HANDLING =================

export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search && { search })
      });

      const res = await fetch(`/api/collections?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to fetch collections');
      }

      const data = await res.json();
      return {
        collections: Array.isArray(data.data) ? data.data : data,
        total: data.total || 0,
        page: data.page || 1,
        pages: data.pages || 1
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'collections/fetchProducts',
  async ({ page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({ page, limit });
      const res = await fetch(`/api/products?${queryParams}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Failed to fetch products');

      const data = await res.json();
      return {
        products: Array.isArray(data.data) ? data.data : data,
        total: data.total || 0
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  'collections/createCollection',
  async ({ name, description = '', products, token }, { rejectWithValue }) => {
    try {
      if (!name?.trim()) {
        throw new Error('Collection name is required');
      }

      if (name.length < 2) {
        throw new Error('Collection name must be at least 2 characters');
      }

      if (name.length > 100) {
        throw new Error('Collection name must be less than 100 characters');
      }

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          products: Array.isArray(products) ? products : []
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create collection');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCollection = createAsyncThunk(
  'collections/updateCollection',
  async ({ id, name, description = '', products, token }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Collection ID is required');
      if (!name?.trim()) throw new Error('Collection name is required');
      if (name.length < 2) throw new Error('Name must be at least 2 characters');
      if (name.length > 100) throw new Error('Name must be less than 100 characters');

      const res = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          products: Array.isArray(products) ? products : []
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update collection');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collections/deleteCollection',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Collection ID is required');

      const res = await fetch(`/api/collections/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to delete collection');
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const bulkDeleteCollections = createAsyncThunk(
  'collections/bulkDeleteCollections',
  async ({ ids, token }, { rejectWithValue }) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('No collections selected');
      }

      const res = await fetch('/api/collections/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });

      if (!res.ok) throw new Error('Failed to delete collections');

      return ids;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ================= INITIAL STATE =================

const initialState = {
  collections: [],
  products: [],
  loading: false,
  error: null,
  success: null,

  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalCollections: 0,
  itemsPerPage: 10,

  // Search & Filter
  searchQuery: '',
  filteredCollections: [],

  // Modal states
  showModal: false,
  modalMode: 'create', // create | edit
  currentId: null,

  // Form states
  formData: {
    name: '',
    description: '',
    selectedProducts: []
  },

  // Edit form states
  editFormData: {
    name: '',
    description: '',
    editProducts: []
  },

  // Bulk operations
  selectedCollections: [],
  showBulkDelete: false,

  // UI states
  sortBy: 'createdAt', // createdAt | name
  sortOrder: 'desc', // desc | asc
};

// ================= SLICE =================

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    // ===== FORM ACTIONS =====
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    resetFormData: (state) => {
      state.formData = {
        name: '',
        description: '',
        selectedProducts: []
      };
      state.error = null;
    },

    toggleProductSelect: (state, action) => {
      const productId = action.payload;
      if (state.formData.selectedProducts.includes(productId)) {
        state.formData.selectedProducts = state.formData.selectedProducts.filter(
          p => p !== productId
        );
      } else {
        state.formData.selectedProducts.push(productId);
      }
    },

    // ===== MODAL ACTIONS =====
    openCreateModal: (state) => {
      state.showModal = true;
      state.modalMode = 'create';
      state.currentId = null;
      state.editFormData = {
        name: '',
        description: '',
        editProducts: []
      };
      state.error = null;
    },

    openEditModal: (state, action) => {
      const collection = action.payload;
      state.showModal = true;
      state.modalMode = 'edit';
      state.currentId = collection._id;
      state.editFormData = {
        name: collection.name,
        description: collection.description || '',
        editProducts: collection.products?.map(p => p._id || p) || []
      };
      state.error = null;
    },

    closeModal: (state) => {
      state.showModal = false;
      state.currentId = null;
      state.editFormData = {
        name: '',
        description: '',
        editProducts: []
      };
      state.error = null;
    },

    setEditFormData: (state, action) => {
      state.editFormData = { ...state.editFormData, ...action.payload };
    },

    toggleEditProductSelect: (state, action) => {
      const productId = action.payload;
      if (state.editFormData.editProducts.includes(productId)) {
        state.editFormData.editProducts = state.editFormData.editProducts.filter(
          p => p !== productId
        );
      } else {
        state.editFormData.editProducts.push(productId);
      }
    },

    // ===== SEARCH & FILTER =====
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },

    setSortOptions: (state, action) => {
      state.sortBy = action.payload.sortBy || state.sortBy;
      state.sortOrder = action.payload.sortOrder || state.sortOrder;
    },

    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    // ===== BULK OPERATIONS =====
    toggleSelectCollection: (state, action) => {
      const id = action.payload;
      if (state.selectedCollections.includes(id)) {
        state.selectedCollections = state.selectedCollections.filter(sid => sid !== id);
      } else {
        state.selectedCollections.push(id);
      }
    },

    selectAllCollections: (state) => {
      state.selectedCollections = state.collections.map(c => c._id);
    },

    clearSelection: (state) => {
      state.selectedCollections = [];
    },

    openBulkDeleteConfirm: (state) => {
      state.showBulkDelete = true;
    },

    closeBulkDeleteConfirm: (state) => {
      state.showBulkDelete = false;
    },

    // ===== ERROR & SUCCESS =====
    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = null;
    }
  },

  extraReducers: (builder) => {
    // ===== FETCH COLLECTIONS =====
    builder
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload.collections || [];
        state.totalCollections = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.pages || 1;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch collections';
        state.collections = [];
      });

    // ===== FETCH PRODUCTS =====
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      });

    // ===== CREATE COLLECTION =====
    builder
      .addCase(createCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.collections.unshift(action.payload);
        state.totalCollections += 1;
        state.success = 'Collection created successfully!';
        state.formData = {
          name: '',
          description: '',
          selectedProducts: []
        };
      })
      .addCase(createCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create collection';
      });

    // ===== UPDATE COLLECTION =====
    builder
      .addCase(updateCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.collections.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.collections[index] = action.payload;
        }
        state.success = 'Collection updated successfully!';
        state.showModal = false;
      })
      .addCase(updateCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update collection';
      });

    // ===== DELETE COLLECTION =====
    builder
      .addCase(deleteCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.filter(c => c._id !== action.payload);
        state.totalCollections -= 1;
        state.success = 'Collection deleted successfully!';
      })
      .addCase(deleteCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete collection';
      });

    // ===== BULK DELETE COLLECTIONS =====
    builder
      .addCase(bulkDeleteCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkDeleteCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = state.collections.filter(
          c => !action.payload.includes(c._id)
        );
        state.selectedCollections = [];
        state.showBulkDelete = false;
        state.success = `${action.payload.length} collection(s) deleted!`;
        state.totalCollections -= action.payload.length;
      })
      .addCase(bulkDeleteCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete collections';
      });
  }
});

// ================= EXPORTS =================

export const {
  setFormData,
  resetFormData,
  toggleProductSelect,
  openCreateModal,
  openEditModal,
  closeModal,
  setEditFormData,
  toggleEditProductSelect,
  setSearchQuery,
  setSortOptions,
  setCurrentPage,
  toggleSelectCollection,
  selectAllCollections,
  clearSelection,
  openBulkDeleteConfirm,
  closeBulkDeleteConfirm,
  clearError,
  clearSuccess
} = collectionsSlice.actions;

export default collectionsSlice.reducer;