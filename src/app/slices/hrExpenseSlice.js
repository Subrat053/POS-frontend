import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expenses: [
    { id: 'EXP-101', category: 'Utilities', amount: 450.00, warehouse: 'Chicago HQ', date: '2026-06-20', description: 'Electric bill June 2026' },
    { id: 'EXP-102', category: 'Marketing', amount: 1200.00, warehouse: 'New York Outlet', date: '2026-06-22', description: 'Local Google Maps Ads campaign' },
    { id: 'EXP-103', category: 'Rent', amount: 3500.00, warehouse: 'Chicago HQ', date: '2026-06-01', description: 'Storefront lease' }
  ],
  employees: [
    { id: 'EMP-01', name: 'Alex Jones', role: 'Super Admin', email: 'admin@enterprise.com', phone: '+1 312-555-0101', location: 'Chicago HQ', status: 'Clocked Out' },
    { id: 'EMP-02', name: 'Marcus Vance', role: 'Store Manager', email: 'manager@enterprise.com', phone: '+1 312-555-0102', location: 'Chicago HQ', status: 'Clocked In' },
    { id: 'EMP-03', name: 'Carla Smith', role: 'Cashier', email: 'cashier@enterprise.com', phone: '+1 212-555-0103', location: 'New York Outlet', status: 'Clocked In' },
    { id: 'EMP-04', name: 'Ian Brown', role: 'Inventory Manager', email: 'inventory@enterprise.com', phone: '+1 415-555-0104', location: 'San Francisco Branch', status: 'Clocked Out' }
  ],
  attendanceLogs: [
    { id: 'ATT-201', employeeName: 'Marcus Vance', event: 'Clock In', timestamp: '2026-06-26T08:00:00Z' },
    { id: 'ATT-202', employeeName: 'Carla Smith', event: 'Clock In', timestamp: '2026-06-26T08:30:00Z' }
  ]
};

const hrExpenseSlice = createSlice({
  name: 'hrExpense',
  initialState,
  reducers: {
    addExpense: (state, action) => {
      state.expenses.unshift({
        id: `EXP-${Date.now().toString().slice(-4)}`,
        ...action.payload
      });
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter(e => e.id !== action.payload);
    },
    addEmployee: (state, action) => {
      state.employees.unshift({
        id: `EMP-${Date.now().toString().slice(-4)}`,
        status: 'Clocked Out',
        ...action.payload
      });
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter(emp => emp.id !== action.payload);
    },
    logAttendance: (state, action) => {
      const { employeeId, event } = action.payload;
      const emp = state.employees.find(e => e.id === employeeId);
      if (emp) {
        emp.status = event === 'Clock In' ? 'Clock In' : 'Clock Out';
        state.attendanceLogs.unshift({
          id: `ATT-${Date.now().toString().slice(-4)}`,
          employeeName: emp.name,
          event,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
});

export const {
  addExpense,
  deleteExpense,
  addEmployee,
  deleteEmployee,
  logAttendance
} = hrExpenseSlice.actions;

export default hrExpenseSlice.reducer;
