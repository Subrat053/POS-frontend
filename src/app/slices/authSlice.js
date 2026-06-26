import { createSlice } from '@reduxjs/toolkit';

const initialUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('pos_user')) : null;

const initialState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  loading: false,
  error: null,
  availableUsers: [
    { id: 'usr-1', email: 'admin@enterprise.com', name: 'Alex SuperAdmin', role: 'Super Admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    { id: 'usr-2', email: 'manager@enterprise.com', name: 'Marcus StoreManager', role: 'Store Manager', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    { id: 'usr-3', email: 'cashier@enterprise.com', name: 'Carla Cashier', role: 'Cashier', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    { id: 'usr-4', email: 'inventory@enterprise.com', name: 'Ian Inventory', role: 'Inventory Manager', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
  ],
  rolesPermissions: {
    'Super Admin': { dashboard: true, pos: true, products: true, inventory: true, purchases: true, expenses: true, hr: true, access: true, reports: true, settings: true },
    'Store Manager': { dashboard: true, pos: true, products: true, inventory: true, purchases: true, expenses: true, hr: true, access: false, reports: true, settings: true },
    'Cashier': { dashboard: false, pos: true, products: false, inventory: false, purchases: false, expenses: false, hr: false, access: false, reports: false, settings: false },
    'Inventory Manager': { dashboard: true, pos: false, products: true, inventory: true, purchases: true, expenses: false, hr: false, access: false, reports: false, settings: false }
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('pos_user', JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('pos_user');
    },
    clearError: (state) => {
      state.error = null;
    },
    addUser: (state, action) => {
      state.availableUsers.push({
        id: `usr-${Date.now().toString().slice(-4)}`,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        ...action.payload
      });
    },
    deleteUser: (state, action) => {
      state.availableUsers = state.availableUsers.filter(u => u.id !== action.payload);
    },
    updateRolePermissions: (state, action) => {
      const { role, module, allowed } = action.payload;
      if (state.rolesPermissions[role]) {
        state.rolesPermissions[role][module] = allowed;
      }
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
        localStorage.setItem('pos_user', JSON.stringify(state.user));
        const idx = state.availableUsers.findIndex(u => u.email === state.user.email);
        if (idx > -1) {
          state.availableUsers[idx] = {
            ...state.availableUsers[idx],
            ...action.payload
          };
        }
      }
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  addUser,
  deleteUser,
  updateRolePermissions,
  updateProfile
} = authSlice.actions;

export default authSlice.reducer;
