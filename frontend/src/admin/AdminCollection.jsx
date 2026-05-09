import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCollections,
  fetchProducts,
  createCollection,
  updateCollection,
  deleteCollection,
  bulkDeleteCollections,
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
} from '../redux/Slice/Collectionsslice';

// ================= TOAST NOTIFICATION COMPONENT =================

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b'
  }[type];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColor,
      color: '#fff',
      padding: '15px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      {message}
    </div>
  );
};

// ================= LOADING SPINNER COMPONENT =================

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #27272a',
      borderTop: '4px solid #f97316',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

// ================= MAIN COMPONENT =================

const AdminCollections = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const collectionsState = useSelector((state) => state.collections) || {};

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const {
    collections = [],
    products = [],
    loading = false,
    error = null,
    success = null,
    showModal = false,
    modalMode = 'create',
    currentId = null,
    formData = {},
    editFormData = {},
    currentPage = 1,
    totalPages = 1,
    totalCollections = 0,
    searchQuery = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
    selectedCollections = [],
    showBulkDelete = false
  } = collectionsState;

  // ================= EFFECTS =================

  useEffect(() => {
    dispatch(fetchCollections({ page: currentPage, search: searchQuery }));
    dispatch(fetchProducts());
  }, [dispatch, currentPage, searchQuery]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      setToastMessage(success);
      setToastType('success');
      setShowToast(true);
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  // ================= HANDLERS =================

  const handleCreate = (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setToastMessage('Collection name is required');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (formData.name.length < 2) {
      setToastMessage('Name must be at least 2 characters');
      setToastType('error');
      setShowToast(true);
      return;
    }

    dispatch(
      createCollection({
        name: formData.name,
        description: formData.description || '',
        products: formData.selectedProducts || [],
        token: auth?.user?.token
      })
    ).then(() => {
      dispatch(resetFormData());
      dispatch(setCurrentPage(1));
    });
  };

  const handleUpdate = () => {
    if (!editFormData.name?.trim()) {
      setToastMessage('Collection name is required');
      setToastType('error');
      setShowToast(true);
      return;
    }

    dispatch(
      updateCollection({
        id: currentId,
        name: editFormData.name,
        description: editFormData.description || '',
        products: editFormData.editProducts || [],
        token: auth?.user?.token
      })
    );
  };

  const handleDeleteSingle = (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    dispatch(
      deleteCollection({
        id,
        token: auth?.user?.token
      })
    );
  };

  const handleBulkDelete = () => {
    if (selectedCollections.length === 0) {
      setToastMessage('Please select collections to delete');
      setToastType('warning');
      setShowToast(true);
      return;
    }

    dispatch(openBulkDeleteConfirm());
  };

  const confirmBulkDelete = () => {
    dispatch(
      bulkDeleteCollections({
        ids: selectedCollections,
        token: auth?.user?.token
      })
    );
  };

  const handleSearch = (value) => {
    dispatch(setSearchQuery(value));
  };

  const handleSort = (column) => {
    const newOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    dispatch(setSortOptions({ sortBy: column, sortOrder: newOrder }));
  };

  // ================= RENDER =================

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <h1 style={{ color: '#f97316', margin: '0 0 20px 0' }}>📦 Manage Collections</h1>
        <p style={{ color: '#a1a1aa', margin: '0' }}>
          Total Collections: <strong style={{ color: '#fff' }}>{totalCollections}</strong>
        </p>
      </div>

      {/* ACTION BUTTONS */}
      <div style={actionBarStyle}>
        <button
          onClick={() => dispatch(openCreateModal())}
          style={primaryBtnStyle}
          disabled={loading}
        >
          ➕ Create Collection
        </button>

        {selectedCollections.length > 0 && (
          <>
            <span style={{ color: '#a1a1aa', margin: '0 10px' }}>
              {selectedCollections.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              style={dangerBtnStyle}
              disabled={loading}
            >
              🗑️ Delete Selected
            </button>
            <button
              onClick={() => dispatch(clearSelection())}
              style={secondaryBtnStyle}
              disabled={loading}
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* SEARCH & FILTER */}
      <div style={filterBarStyle}>
        <input
          type="text"
          placeholder="🔍 Search collections..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={searchInputStyle}
        />

        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value)}
          style={selectStyle}
        >
          <option value="createdAt">Recently Created</option>
          <option value="name">Name (A-Z)</option>
          <option value="products">Most Products</option>
        </select>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div style={errorBannerStyle}>
          ⚠️ {error}
          <button
            onClick={() => dispatch(clearError())}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && collections.length === 0 && <LoadingSpinner />}

      {/* COLLECTIONS TABLE */}
      {collections.length > 0 && (
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    checked={selectedCollections.length === collections.length && collections.length > 0}
                    onChange={() => selectedCollections.length === collections.length ? dispatch(clearSelection()) : dispatch(selectAllCollections())}
                  />
                </th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Products</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col) => (
                <tr key={col._id} style={tableRowStyle}>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(col._id)}
                      onChange={() => dispatch(toggleSelectCollection(col._id))}
                    />
                  </td>
                  <td style={tdStyle}>
                    <div>
                      <strong>{col.name}</strong>
                      {col.description && (
                        <p style={{ color: '#a1a1aa', fontSize: '12px', margin: '5px 0 0 0' }}>
                          {col.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle}>{col.products?.length || 0}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: '#a1a1aa', fontSize: '12px' }}>
                      {new Date(col.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => dispatch(openEditModal(col))}
                      style={editBtnSmallStyle}
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSingle(col._id)}
                      style={deleteBtnSmallStyle}
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && collections.length === 0 && (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
          <p style={{ color: '#a1a1aa', margin: '0' }}>No collections yet</p>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '12px' }}>
            Create your first collection to get started
          </p>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={paginationStyle}>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage - 1))}
            disabled={currentPage === 1 || loading}
            style={{ ...paginationBtnStyle, opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            ← Previous
          </button>
          <span style={{ color: '#a1a1aa', margin: '0 10px' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setCurrentPage(currentPage + 1))}
            disabled={currentPage === totalPages || loading}
            style={{ ...paginationBtnStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ================= CREATE/EDIT MODAL ================= */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={modalHeaderStyle}>
              <h2 style={{ color: '#f97316', margin: '0' }}>
                {modalMode === 'create' ? '➕ Create Collection' : '✏️ Edit Collection'}
              </h2>
              <button
                onClick={() => dispatch(closeModal())}
                style={closeModalBtnStyle}
              >
                ✕
              </button>
            </div>

            {modalMode === 'create' ? (
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  placeholder="Collection Name *"
                  value={formData.name || ''}
                  onChange={(e) => dispatch(setFormData({ name: e.target.value }))}
                  style={inputStyle}
                  maxLength={100}
                />

                <textarea
                  placeholder="Description (optional)"
                  value={formData.description || ''}
                  onChange={(e) => dispatch(setFormData({ description: e.target.value }))}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  maxLength={500}
                />

                <div style={productBoxStyle}>
                  <p style={{ color: '#a1a1aa', margin: '0 0 10px 0' }}>Select Products</p>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {products.length === 0 ? (
                      <p style={{ color: '#a1a1aa', fontSize: '12px' }}>No products available</p>
                    ) : (
                      products.map((p) => (
                        <label key={p._id} style={checkboxLabelStyle}>
                          <input
                            type="checkbox"
                            checked={(formData.selectedProducts || []).includes(p._id)}
                            onChange={() => dispatch(toggleProductSelect(p._id))}
                          />
                          <span>{p.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div style={modalButtonsStyle}>
                  <button
                    type="submit"
                    style={primaryBtnStyle}
                    disabled={loading}
                  >
                    {loading ? '⏳ Creating...' : '✓ Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(closeModal())}
                    style={secondaryBtnStyle}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                <input
                  type="text"
                  placeholder="Collection Name *"
                  value={editFormData.name || ''}
                  onChange={(e) => dispatch(setEditFormData({ name: e.target.value }))}
                  style={inputStyle}
                  maxLength={100}
                />

                <textarea
                  placeholder="Description (optional)"
                  value={editFormData.description || ''}
                  onChange={(e) => dispatch(setEditFormData({ description: e.target.value }))}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                  maxLength={500}
                />

                <div style={productBoxStyle}>
                  <p style={{ color: '#a1a1aa', margin: '0 0 10px 0' }}>Edit Products</p>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {products.map((p) => (
                      <label key={p._id} style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={(editFormData.editProducts || []).includes(p._id)}
                          onChange={() => dispatch(toggleEditProductSelect(p._id))}
                        />
                        <span>{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={modalButtonsStyle}>
                  <button
                    type="submit"
                    style={primaryBtnStyle}
                    disabled={loading}
                  >
                    {loading ? '⏳ Updating...' : '✓ Update'}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(closeModal())}
                    style={secondaryBtnStyle}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= BULK DELETE CONFIRMATION ================= */}
      {showBulkDelete && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '400px' }}>
            <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>⚠️ Confirm Delete</h3>
            <p style={{ color: '#a1a1aa', margin: '0 0 20px 0' }}>
              Delete {selectedCollections.length} collection(s)? This action cannot be undone.
            </p>
            <div style={modalButtonsStyle}>
              <button
                onClick={confirmBulkDelete}
                style={dangerBtnStyle}
                disabled={loading}
              >
                {loading ? '⏳ Deleting...' : '🗑️ Delete'}
              </button>
              <button
                onClick={() => dispatch(closeBulkDeleteConfirm())}
                style={secondaryBtnStyle}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* STYLES - ANIMATION */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// ================= STYLES =================

const containerStyle = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '30px',
  background: '#18181b',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.05)',
  color: '#fff'
};

const headerStyle = {
  marginBottom: '30px',
  borderBottom: '1px solid #27272a',
  paddingBottom: '20px'
};

const actionBarStyle = {
  display: 'flex',
  gap: '10px',
  marginBottom: '20px',
  alignItems: 'center',
  flexWrap: 'wrap'
};

const filterBarStyle = {
  display: 'flex',
  gap: '15px',
  marginBottom: '20px',
  flexWrap: 'wrap'
};

const searchInputStyle = {
  flex: '1',
  minWidth: '250px',
  padding: '10px 15px',
  background: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px'
};

const selectStyle = {
  padding: '10px 15px',
  background: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '6px',
  color: '#fff',
  cursor: 'pointer'
};

const primaryBtnStyle = {
  padding: '10px 15px',
  background: '#f97316',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'all 0.3s'
};

const secondaryBtnStyle = {
  padding: '10px 15px',
  background: '#3f3f46',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.3s'
};

const dangerBtnStyle = {
  padding: '10px 15px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const errorBannerStyle = {
  background: '#7f1d1d',
  border: '1px solid #dc2626',
  color: '#fecaca',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const tableContainerStyle = {
  overflowX: 'auto',
  marginBottom: '20px',
  border: '1px solid #27272a',
  borderRadius: '8px'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse'
};

const tableHeaderStyle = {
  background: '#09090b',
  borderBottom: '2px solid #27272a'
};

const thStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  fontWeight: 'bold',
  color: '#a1a1aa',
  fontSize: '12px',
  textTransform: 'uppercase'
};

const tableRowStyle = {
  borderBottom: '1px solid #27272a',
  transition: 'background 0.2s'
};

const tdStyle = {
  padding: '12px 15px'
};

const badgeStyle = {
  display: 'inline-block',
  background: '#f97316',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const editBtnSmallStyle = {
  padding: '5px 10px',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  marginRight: '5px'
};

const deleteBtnSmallStyle = {
  padding: '5px 10px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#a1a1aa'
};

const paginationStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  marginTop: '20px'
};

const paginationBtnStyle = {
  padding: '8px 15px',
  background: '#27272a',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
  padding: '20px'
};

const modalBoxStyle = {
  background: '#18181b',
  padding: '30px',
  borderRadius: '12px',
  border: '1px solid #27272a',
  maxHeight: '90vh',
  overflowY: 'auto',
  maxWidth: '600px',
  width: '100%'
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '15px',
  borderBottom: '1px solid #27272a'
};

const closeModalBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#a1a1aa',
  fontSize: '24px',
  cursor: 'pointer'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '6px',
  color: '#fff',
  marginBottom: '15px',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const productBoxStyle = {
  background: '#09090b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  padding: '15px',
  marginBottom: '15px'
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  cursor: 'pointer',
  color: '#fff',
  userSelect: 'none'
};

const modalButtonsStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px'
};

export default AdminCollections;