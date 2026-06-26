import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  activeStore: 'Chicago HQ',
  availableStores: ['Chicago HQ', 'New York Outlet', 'San Francisco Branch', 'London Express'],
  language: 'en',
  currency: { symbol: '$', code: 'USD' },
  notifications: [
    { id: '1', title: 'Low Stock Alert', message: 'MacBook Pro stock is below warning level (2 left).', type: 'warning', time: '10 mins ago', read: false },
    { id: '2', title: 'Daily Report Ready', message: 'The sales report for yesterday is ready to view.', type: 'info', time: '1 hour ago', read: false },
    { id: '3', title: 'New PO Approved', message: 'Purchase Order #PO-2026-004 has been approved.', type: 'success', time: '2 hours ago', read: true }
  ],
  storeSettings: {
    name: 'POS Enterprise Store',
    email: 'chicago@posenterprise.com',
    phone: '+1 (312) 555-0100',
    address: '100 E Chicago Ave, Chicago, IL',
    defaultTaxRate: 8.25,
    currencyCode: 'USD',
    receiptHeader: 'POS ENTERPRISE STORE'
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    changeStore: (state, action) => {
      state.activeStore = action.payload;
      state.storeSettings.address = action.payload === 'Chicago HQ' 
        ? '100 E Chicago Ave, Chicago, IL'
        : action.payload === 'New York Outlet'
        ? '767 5th Ave, New York, NY'
        : '845 Market St, San Francisco, CA';
    },
    changeLanguage: (state, action) => {
      state.language = action.payload;
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now().toString(),
        read: false,
        time: 'Just now',
        ...action.payload
      });
    },
    updateStoreSettings: (state, action) => {
      state.storeSettings = {
        ...state.storeSettings,
        ...action.payload
      };
      if (action.payload.currencyCode) {
        state.currency.code = action.payload.currencyCode;
        state.currency.symbol = action.payload.currencyCode === 'EUR' ? '€' : action.payload.currencyCode === 'GBP' ? '£' : '$';
      }
    }
  }
});

export const { 
  toggleSidebar, 
  setSidebarCollapsed, 
  changeStore, 
  changeLanguage, 
  markAllNotificationsRead, 
  addNotification,
  updateStoreSettings 
} = settingsSlice.actions;

export default settingsSlice.reducer;
