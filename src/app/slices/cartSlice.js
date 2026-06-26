import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  customer: null,
  discount: { type: 'percent', value: 0 },
  taxRate: 8.25, // default tax rate %
  notes: '',
  heldOrders: [] // list of held carts
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, selectedVariant } = action.payload;
      const itemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
      
      const existing = state.items.find(item => item.id === itemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({
          id: itemId,
          product,
          variant: selectedVariant || null,
          price: selectedVariant ? selectedVariant.price : product.price,
          quantity: 1
        });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.customer = null;
      state.discount = { type: 'percent', value: 0 };
      state.notes = '';
    },
    holdOrder: (state, action) => {
      if (state.items.length === 0) return;
      state.heldOrders.push({
        id: `HOLD-${Date.now()}`,
        items: [...state.items],
        customer: state.customer,
        discount: state.discount,
        notes: state.notes,
        createdAt: new Date().toISOString()
      });
      state.items = [];
      state.customer = null;
      state.discount = { type: 'percent', value: 0 };
      state.notes = '';
    },
    recallHeldOrder: (state, action) => {
      const orderId = action.payload;
      const orderIndex = state.heldOrders.findIndex(o => o.id === orderId);
      if (orderIndex > -1) {
        const order = state.heldOrders[orderIndex];
        state.items = order.items;
        state.customer = order.customer;
        state.discount = order.discount;
        state.notes = order.notes;
        state.heldOrders.splice(orderIndex, 1);
      }
    },
    deleteHeldOrder: (state, action) => {
      state.heldOrders = state.heldOrders.filter(o => o.id !== action.payload);
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setCustomer,
  setDiscount,
  setNotes,
  clearCart,
  holdOrder,
  recallHeldOrder,
  deleteHeldOrder
} = cartSlice.actions;

export default cartSlice.reducer;
