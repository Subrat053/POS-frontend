import { createSlice } from '@reduxjs/toolkit';
import { MOCK_PRODUCTS } from '../../services/mockApi';

const initialProducts = MOCK_PRODUCTS.map(p => ({
  ...p,
  warehouseStock: {
    'Chicago HQ': Math.floor(p.stock * 0.6),
    'New York Outlet': Math.floor(p.stock * 0.3),
    'San Francisco Branch': p.stock - Math.floor(p.stock * 0.6) - Math.floor(p.stock * 0.3)
  }
}));

const initialState = {
  products: initialProducts,
  categories: ['Electronics', 'Furniture', 'Accessories', 'Groceries', 'Apparel'],
  brands: ['Apple', 'Steelcase', 'Fully', 'Sony', 'Logitech', 'Samsung', 'Nike'],
  stockAdjustments: [
    { id: 'ADJ-101', productId: '2', productName: 'iPad Pro 12.9"', warehouse: 'Chicago HQ', quantity: -2, reason: 'Damaged item', date: '2026-06-25T14:30:00Z', user: 'Marcus StoreManager' }
  ],
  transfers: [
    { id: 'TRF-201', productId: '3', productName: 'iPhone 15 Pro Max', fromWarehouse: 'Chicago HQ', toWarehouse: 'New York Outlet', quantity: 5, status: 'Completed', date: '2026-06-24T10:15:00Z' }
  ],
  loading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const stock = action.payload.stock || 0;
      const initialWarehouseStock = {
        'Chicago HQ': Math.floor(stock * 0.6),
        'New York Outlet': Math.floor(stock * 0.3),
        'San Francisco Branch': stock - Math.floor(stock * 0.6) - Math.floor(stock * 0.3)
      };
      
      state.products.unshift({
        id: `PROD-${Date.now()}`,
        status: stock > action.payload.minStock ? 'In Stock' : stock === 0 ? 'Out of Stock' : 'Low Stock',
        warehouseStock: initialWarehouseStock,
        ...action.payload
      });
    },
    updateProduct: (state, action) => {
      const idx = state.products.findIndex(p => p.id === action.payload.id);
      if (idx > -1) {
        const updatedStock = action.payload.stock;
        const minStock = action.payload.minStock;
        let status = 'In Stock';
        if (updatedStock === 0) status = 'Out of Stock';
        else if (updatedStock <= minStock) status = 'Low Stock';
        
        state.products[idx] = {
          ...state.products[idx],
          ...action.payload,
          status
        };
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    bulkDeleteProducts: (state, action) => {
      const idsToDelete = action.payload;
      state.products = state.products.filter(p => !idsToDelete.includes(p.id));
    },
    addCategory: (state, action) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c !== action.payload);
    },
    addBrand: (state, action) => {
      if (!state.brands.includes(action.payload)) {
        state.brands.push(action.payload);
      }
    },
    deleteBrand: (state, action) => {
      state.brands = state.brands.filter(b => b !== action.payload);
    },
    deductProductStock: (state, action) => {
      action.payload.forEach(({ id, quantity }) => {
        const baseId = id.split('-')[0];
        const product = state.products.find(p => p.id === baseId);
        if (product) {
          product.stock = Math.max(0, product.stock - quantity);
          if (product.warehouseStock) {
            // Deduct from primary store Chicago HQ by default for POS checkout
            product.warehouseStock['Chicago HQ'] = Math.max(0, (product.warehouseStock['Chicago HQ'] || 0) - quantity);
          }
          if (product.stock === 0) product.status = 'Out of Stock';
          else if (product.stock <= product.minStock) product.status = 'Low Stock';
          else product.status = 'In Stock';
        }
      });
    },
    adjustProductStock: (state, action) => {
      const { productId, warehouse, quantity, reason, user } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        if (!product.warehouseStock) {
          product.warehouseStock = { 'Chicago HQ': product.stock, 'New York Outlet': 0, 'San Francisco Branch': 0 };
        }
        product.warehouseStock[warehouse] = Math.max(0, (product.warehouseStock[warehouse] || 0) + quantity);
        product.stock = Object.values(product.warehouseStock).reduce((a, b) => a + b, 0);
        
        if (product.stock === 0) product.status = 'Out of Stock';
        else if (product.stock <= product.minStock) product.status = 'Low Stock';
        else product.status = 'In Stock';

        state.stockAdjustments.unshift({
          id: `ADJ-${Date.now().toString().slice(-4)}`,
          productId,
          productName: product.name,
          warehouse,
          quantity,
          reason,
          date: new Date().toISOString(),
          user
        });
      }
    },
    transferProductStock: (state, action) => {
      const { productId, fromWarehouse, toWarehouse, quantity, user } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        if (!product.warehouseStock) {
          product.warehouseStock = { 'Chicago HQ': product.stock, 'New York Outlet': 0, 'San Francisco Branch': 0 };
        }
        const sourceStock = product.warehouseStock[fromWarehouse] || 0;
        if (sourceStock >= quantity) {
          product.warehouseStock[fromWarehouse] -= quantity;
          product.warehouseStock[toWarehouse] = (product.warehouseStock[toWarehouse] || 0) + quantity;

          state.transfers.unshift({
            id: `TRF-${Date.now().toString().slice(-4)}`,
            productId,
            productName: product.name,
            fromWarehouse,
            toWarehouse,
            quantity,
            status: 'Completed',
            date: new Date().toISOString(),
            user
          });
        }
      }
    },
    receiveStockFromPO: (state, action) => {
      const { items, warehouse } = action.payload;
      items.forEach(({ productId, quantity }) => {
        const product = state.products.find(p => p.id === productId);
        if (product) {
          if (!product.warehouseStock) {
            product.warehouseStock = { 'Chicago HQ': product.stock, 'New York Outlet': 0, 'San Francisco Branch': 0 };
          }
          product.warehouseStock[warehouse] = (product.warehouseStock[warehouse] || 0) + quantity;
          product.stock = Object.values(product.warehouseStock).reduce((a, b) => a + b, 0);
          
          if (product.stock === 0) product.status = 'Out of Stock';
          else if (product.stock <= product.minStock) product.status = 'Low Stock';
          else product.status = 'In Stock';
        }
      });
    }
  }
});

export const {
  addProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  addCategory,
  deleteCategory,
  addBrand,
  deleteBrand,
  deductProductStock,
  adjustProductStock,
  transferProductStock,
  receiveStockFromPO
} = productsSlice.actions;

export default productsSlice.reducer;
