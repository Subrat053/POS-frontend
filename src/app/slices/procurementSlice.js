import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  suppliers: [
    { id: 'SUP-01', name: 'Apple Wholesale Supply', email: 'orders@apple-wholesale.com', phone: '+1 800-555-0199', address: '1 Infinite Loop, Cupertino, CA' },
    { id: 'SUP-02', name: 'Steelcase Corp USA', email: 'sales@steelcase-office.com', phone: '+1 800-333-9988', address: '901 44th St SE, Grand Rapids, MI' },
    { id: 'SUP-03', name: 'Sony Audio Distributors', email: 'orders@sony-distribution.com', phone: '+1 800-222-7669', address: '115 W Century Rd, Paramus, NJ' }
  ],
  purchaseOrders: [
    {
      id: 'PO-2026-001',
      supplierId: 'SUP-01',
      supplierName: 'Apple Wholesale Supply',
      warehouse: 'Chicago HQ',
      status: 'Received',
      items: [
        { productId: '1', productName: 'MacBook Pro 16" M3', quantity: 4, costPrice: 1800.00 }
      ],
      totalAmount: 7200.00,
      createdAt: '2026-06-20T09:00:00Z'
    },
    {
      id: 'PO-2026-002',
      supplierId: 'SUP-03',
      supplierName: 'Sony Audio Distributors',
      warehouse: 'New York Outlet',
      status: 'Approved',
      items: [
        { productId: '6', productName: 'Bluetooth ANC Headphones', quantity: 15, costPrice: 200.00 }
      ],
      totalAmount: 3000.00,
      createdAt: '2026-06-25T11:30:00Z'
    }
  ]
};

const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    addSupplier: (state, action) => {
      state.suppliers.push({
        id: `SUP-${Date.now().toString().slice(-4)}`,
        ...action.payload
      });
    },
    deleteSupplier: (state, action) => {
      state.suppliers = state.suppliers.filter(s => s.id !== action.payload);
    },
    createPurchaseOrder: (state, action) => {
      state.purchaseOrders.unshift({
        id: `PO-2026-${Date.now().toString().slice(-4)}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        ...action.payload
      });
    },
    approvePurchaseOrder: (state, action) => {
      const po = state.purchaseOrders.find(p => p.id === action.payload);
      if (po && po.status === 'Pending') {
        po.status = 'Approved';
      }
    },
    receivePurchaseOrder: (state, action) => {
      const po = state.purchaseOrders.find(p => p.id === action.payload);
      if (po && po.status === 'Approved') {
        po.status = 'Received';
      }
    }
  }
});

export const {
  addSupplier,
  deleteSupplier,
  createPurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder
} = procurementSlice.actions;

export default procurementSlice.reducer;
