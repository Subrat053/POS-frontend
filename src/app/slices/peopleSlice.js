import { createSlice } from '@reduxjs/toolkit';
import { MOCK_CUSTOMERS } from '../../services/mockApi';

const initialState = {
  customers: MOCK_CUSTOMERS,
  loading: false,
  error: null
};

const peopleSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    addCustomer: (state, action) => {
      state.customers.unshift({
        id: `CUST-${Date.now().toString().slice(-4)}`,
        loyaltyPoints: action.payload.loyaltyPoints || 0,
        tier: action.payload.tier || 'Silver',
        ...action.payload
      });
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(c => c.id !== action.payload);
    },
    updateCustomerPoints: (state, action) => {
      const { id, points } = action.payload;
      const c = state.customers.find(cust => cust.id === id);
      if (c) {
        c.loyaltyPoints = Math.max(0, c.loyaltyPoints + points);
        
        // Dynamic Loyalty Tier calculation
        if (c.loyaltyPoints >= 5000) c.tier = 'VIP';
        else if (c.loyaltyPoints >= 1000) c.tier = 'Platinum';
        else if (c.loyaltyPoints >= 300) c.tier = 'Gold';
        else c.tier = 'Silver';
      }
    }
  }
});

export const { addCustomer, deleteCustomer, updateCustomerPoints } = peopleSlice.actions;
export default peopleSlice.reducer;
