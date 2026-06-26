import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import procurementReducer from './slices/procurementSlice';
import peopleReducer from './slices/peopleSlice';
import hrExpenseReducer from './slices/hrExpenseSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  cart: cartReducer,
  products: productsReducer,
  procurement: procurementReducer,
  people: peopleReducer,
  hrExpense: hrExpenseReducer
});

export default rootReducer;

