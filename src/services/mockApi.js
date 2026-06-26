// Mock enterprise datasets for the POS System

export const MOCK_PRODUCTS = [
  { id: '1', name: 'MacBook Pro 16" M3', sku: 'LAP-MBP-16', barcode: '194253847291', category: 'Electronics', brand: 'Apple', price: 2499.00, cost: 1800.00, tax: 8.25, stock: 12, minStock: 5, status: 'In Stock', variants: [{ id: 'v1', size: '1TB SSD / 36GB RAM', price: 2499.00 }] },
  { id: '2', name: 'iPad Pro 12.9"', sku: 'TAB-IPD-12', barcode: '194253847307', category: 'Electronics', brand: 'Apple', price: 1099.00, cost: 800.00, tax: 8.25, stock: 2, minStock: 5, status: 'Low Stock', variants: [] },
  { id: '3', name: 'iPhone 15 Pro Max', sku: 'MOB-IPH-15', barcode: '194253847314', category: 'Electronics', brand: 'Apple', price: 1199.00, cost: 900.00, tax: 8.25, stock: 24, minStock: 10, status: 'In Stock', variants: [] },
  { id: '4', name: 'Standard Leather Chair', sku: 'FUR-CHR-01', barcode: '205349182305', category: 'Furniture', brand: 'Steelcase', price: 299.00, cost: 150.00, tax: 5.00, stock: 4, minStock: 5, status: 'Low Stock', variants: [] },
  { id: '5', name: 'Standing Desk Pro', sku: 'FUR-DSK-02', barcode: '205349182312', category: 'Furniture', brand: 'Fully', price: 599.00, cost: 350.00, tax: 5.00, stock: 0, minStock: 3, status: 'Out of Stock', variants: [] },
  { id: '6', name: 'Bluetooth ANC Headphones', sku: 'ACC-ANC-03', barcode: '304918273645', category: 'Accessories', brand: 'Sony', price: 349.00, cost: 200.00, tax: 8.25, stock: 45, minStock: 8, status: 'In Stock', variants: [] },
  { id: '7', name: 'Wireless Ergonomic Mouse', sku: 'ACC-MSE-04', barcode: '304918273652', category: 'Accessories', brand: 'Logitech', price: 99.00, cost: 50.00, tax: 8.25, stock: 80, minStock: 15, status: 'In Stock', variants: [] }
];

export const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'John Doe', email: 'john@gmail.com', phone: '+1 312-555-0143', loyaltyPoints: 450, tier: 'Gold' },
  { id: 'c2', name: 'Sarah Connor', email: 'sarah@skynet.com', phone: '+1 312-555-0188', loyaltyPoints: 1200, tier: 'Platinum' },
  { id: 'c3', name: 'Bruce Wayne', email: 'bruce@waynecorp.com', phone: '+1 312-555-0199', loyaltyPoints: 8500, tier: 'VIP' },
  { id: 'c4', name: 'Peter Parker', email: 'peter@dailybugle.com', phone: '+1 718-555-0122', loyaltyPoints: 80, tier: 'Silver' }
];

export const MOCK_ORDERS = [
  { id: 'ORD-2026-001', customerName: 'Bruce Wayne', items: 3, total: 3897.00, paymentMethod: 'Card', status: 'Completed', time: '10:15 AM' },
  { id: 'ORD-2026-002', customerName: 'John Doe', items: 1, total: 99.00, paymentMethod: 'Cash', status: 'Completed', time: '11:30 AM' },
  { id: 'ORD-2026-003', customerName: 'Walk-In Customer', items: 2, total: 448.00, paymentMethod: 'Card', status: 'Pending', time: '12:05 PM' },
  { id: 'ORD-2026-004', customerName: 'Sarah Connor', items: 1, total: 1099.00, paymentMethod: 'Mobile Pay', status: 'Completed', time: '01:40 PM' },
  { id: 'ORD-2026-005', customerName: 'Peter Parker', items: 2, total: 398.00, paymentMethod: 'Cash', status: 'Refunded', time: '02:10 PM' }
];

export const MOCK_ACTIVITY_LOGS = [
  { id: '1', user: 'Alex SuperAdmin', action: 'Configured new tax rate (8.25%)', module: 'Settings', time: '30 mins ago' },
  { id: '2', user: 'Marcus StoreManager', action: 'Approved Purchase Order PO-044', module: 'Procurements', time: '1 hour ago' },
  { id: '3', user: 'Carla Cashier', action: 'Refunded invoice ORD-2026-005', module: 'POS Billing', time: '2 hours ago' },
  { id: '4', user: 'Ian Inventory', action: 'Updated stock count for Standing Desk Pro', module: 'Warehouse', time: '4 hours ago' }
];

export const MOCK_DASHBOARD_STATS = {
  salesTrend: [
    { hour: '09:00', sales: 4200, orders: 12 },
    { hour: '10:00', sales: 7800, orders: 24 },
    { hour: '11:00', sales: 6100, orders: 18 },
    { hour: '12:00', sales: 12500, orders: 35 },
    { hour: '13:00', sales: 9400, orders: 28 },
    { hour: '14:00', sales: 11200, orders: 30 },
    { hour: '15:00', sales: 15400, orders: 42 },
    { hour: '16:00', sales: 13200, orders: 38 }
  ],
  categoryShare: [
    { name: 'Electronics', value: 65 },
    { name: 'Furniture', value: 18 },
    { name: 'Accessories', value: 12 },
    { name: 'Others', value: 5 }
  ],
  stockLevels: [
    { name: 'MacBook Pro', stock: 12, min: 5 },
    { name: 'iPad Pro', stock: 2, min: 5 },
    { name: 'iPhone 15', stock: 24, min: 10 },
    { name: 'Leather Chair', stock: 4, min: 5 },
    { name: 'Standing Desk', stock: 0, min: 3 }
  ]
};
