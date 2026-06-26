import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  UserPlus, 
  Tag, 
  DollarSign, 
  FolderLock, 
  Printer, 
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { 
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
} from '../../app/slices/cartSlice';
import { deductProductStock } from '../../app/slices/productsSlice';
import { addNotification } from '../../app/slices/settingsSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { updateCustomerPoints } from '../../app/slices/peopleSlice';
import toast from 'react-hot-toast';

export function PosTerminal() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { activeStore } = useSelector((state) => state.settings);
  const { items, customer, discount, taxRate, notes, heldOrders } = useSelector((state) => state.cart);
  const { customers } = useSelector((state) => state.people);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // Selection modals
  const [variantProduct, setVariantProduct] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [heldOpen, setHeldOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // Checkout Payment calculations
  const [paymentMethod, setPaymentMethod] = useState('Card'); // 'Cash' | 'Card' | 'Mobile'
  const [cashReceived, setCashReceived] = useState('');
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);

  // Constants
  const categories = ['All', 'Electronics', 'Furniture', 'Accessories'];

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = discount.type === 'percent' 
    ? (subtotal * discount.value) / 100 
    : discount.value;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * taxRate) / 100;
  const total = taxableAmount + taxAmount;

  // Handle barcode scanner input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = products.find(p => p.barcode === barcodeInput.trim());
    if (matchedProduct) {
      if (matchedProduct.stock === 0) {
        toast.error(`"${matchedProduct.name}" is out of stock!`);
        return;
      }
      if (matchedProduct.variants && matchedProduct.variants.length > 0) {
        setVariantProduct(matchedProduct);
      } else {
        dispatch(addToCart({ product: matchedProduct }));
        toast.success(`Scanned: ${matchedProduct.name}`);
      }
      setBarcodeInput('');
    } else {
      toast.error('Barcode not matched to any catalog item');
    }
  };

  // Add Product to Cart
  const handleProductClick = (product) => {
    if (product.stock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    if (product.variants && product.variants.length > 0) {
      setVariantProduct(product);
    } else {
      dispatch(addToCart({ product }));
      toast.success(`${product.name} added to cart`);
    }
  };

  // Select Variant and add to cart
  const handleSelectVariant = (variant) => {
    dispatch(addToCart({ product: variantProduct, selectedVariant: variant }));
    toast.success(`${variantProduct.name} (${variant.size}) added to cart`);
    setVariantProduct(null);
  };

  // Quick cash inputs helper
  const handleQuickCash = (amount) => {
    setCashReceived(amount.toString());
  };

  // Process checkout ticket
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    let received = total;
    if (paymentMethod === 'Cash') {
      received = parseFloat(cashReceived);
      if (isNaN(received) || received < total) {
        toast.error('Insufficient cash amount entered');
        return;
      }
    }

    const changeDue = paymentMethod === 'Cash' ? received - total : 0;
    
    // Save invoice receipt details
    const invoice = {
      invoiceId: `INV-${Date.now().toString().slice(-6)}`,
      items: [...items],
      subtotal,
      discountAmount,
      taxAmount,
      total,
      paymentMethod,
      cashReceived: received,
      changeDue,
      customerName: customer ? customer.name : 'Walk-In Customer',
      createdAt: new Date().toISOString(),
      cashier: user?.name || 'Cashier Terminal'
    };

    setCheckoutInvoice(invoice);

    // Update stocks in products slice
    const stockDeductions = items.map(item => ({
      id: item.id,
      quantity: item.quantity
    }));
    dispatch(deductProductStock(stockDeductions));

    // Reward customer loyalty points (1 point per $10 spent)
    if (customer) {
      dispatch(updateCustomerPoints({
        id: customer.id,
        points: Math.floor(total / 10)
      }));
    }

    // Dispatch low stock warnings if applicable
    items.forEach(item => {
      const match = products.find(p => p.id === item.id.split('-')[0]);
      if (match && (match.stock - item.quantity) <= match.minStock) {
        dispatch(addNotification({
          title: 'Stock Warning Level Alert',
          message: `Product "${match.name}" has reached low stock warning levels (Stock: ${match.stock - item.quantity}).`,
          type: 'warning'
        }));
      }
    });

    setCheckoutOpen(false);
    setReceiptOpen(true);
    toast.success('Transaction Completed successfully!');
  };

  const handlePrintReceipt = () => {
    toast.success(`Printing Ticket ${checkoutInvoice.invoiceId} on thermal printer...`);
    dispatch(clearCart());
    setReceiptOpen(false);
    setCheckoutInvoice(null);
    setCashReceived('');
  };

  const handleHold = () => {
    dispatch(holdOrder());
    toast.success('Cart ticket suspended & saved');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-8rem)] text-left select-none">
      
      {/* LEFT COLUMN: PRODUCT GRID AND SEARCH */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Scanner & Filters Header */}
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-center">
          
          {/* Barcode Scanner simulator input */}
          <form onSubmit={handleBarcodeSubmit} className="w-full md:w-80 flex gap-2">
            <Input
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Barcode Scanner Simulator..."
              icon={<Barcode className="h-4.5 w-4.5 text-primary" />}
              className="h-9"
              helperText="Paste EAN barcode (e.g. 194253847307) + Enter"
            />
          </form>

          <div className="h-6 w-px bg-border hidden md:block" />

          {/* Category Scrollers */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-secondary/40 text-muted-foreground hover:text-foreground'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-48 ml-auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              icon={<Search className="h-4 w-4" />}
              className="h-9"
            />
          </div>

        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((p) => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock <= p.minStock && !isOutOfStock;
                
                return (
                  <Card
                    key={p.id}
                    onClick={() => !isOutOfStock && handleProductClick(p)}
                    className={`relative overflow-hidden cursor-pointer flex flex-col justify-between hover:shadow-md hover:border-primary/20 transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-secondary/10' : ''}`}
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold font-mono text-muted-foreground">{p.sku}</span>
                        {isOutOfStock && <Badge variant="destructive">OUT</Badge>}
                        {isLowStock && <Badge variant="warning">LOW</Badge>}
                      </div>
                      <h4 className="font-bold text-sm text-foreground truncate leading-snug">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.brand} • {p.category}</p>
                      
                      {p.variants && p.variants.length > 0 && (
                        <span className="inline-block text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.25 rounded">
                          {p.variants.length} Variants
                        </span>
                      )}
                    </div>
                    
                    <div className="px-4 py-2.5 bg-secondary/30 border-t border-border flex justify-between items-center text-xs">
                      <span className="font-extrabold text-foreground">{formatCurrency(p.price)}</span>
                      <span className="text-muted-foreground">Stock: <strong>{p.stock}</strong></span>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: ACTIVE CART MANAGEMENT */}
      <div className="w-full xl:w-96 bg-card border border-border rounded-2xl flex flex-col justify-between shadow-sm overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/10">
          <div>
            <h3 className="font-bold text-foreground">Checkout Ticket</h3>
            <p className="text-xs text-muted-foreground">Cashier Terminal • {activeStore}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHeldOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-border text-xs bg-card hover:bg-secondary font-bold text-foreground transition-colors cursor-pointer relative"
            >
              Held Tickets
              {heldOrders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary text-primary-foreground font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                  {heldOrders.length}
                </span>
              )}
            </button>
            <button
              disabled={items.length === 0}
              onClick={() => dispatch(clearCart())}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-2">
              <FolderOpen className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm font-semibold">Active Cart Empty</p>
              <p className="text-xs text-muted-foreground/80 max-w-[180px]">Scan or click products in the catalog to build ticket.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-foreground truncate">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.variant ? `Variant: ${item.variant.size}` : `SKU: ${item.product.sku}`}
                  </p>
                  <p className="text-xs font-semibold text-primary mt-0.5">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2.5">
                  <span className="font-extrabold text-foreground">{formatCurrency(item.price * item.quantity)}</span>
                  <div className="flex items-center gap-1.5 border border-border rounded-lg bg-background p-0.5">
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                    <button
                      onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                      className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer & Parameters Controls */}
        <div className="p-4 border-t border-border bg-secondary/10 space-y-3">
          
          {/* Customer Selection */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <select
              value={customer ? customer.id : ''}
              onChange={(e) => {
                const match = customers.find(c => c.id === e.target.value);
                dispatch(setCustomer(match || null));
              }}
              className="flex-1 h-9 px-3 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-medium"
            >
              <option value="">Select Loyalty Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
              ))}
            </select>
          </div>

          {customer && (
            <div className="flex items-center justify-between text-xs border border-primary/20 bg-primary/5 p-2 rounded-lg">
              <span className="font-semibold text-foreground">Loyalty Points: <strong className="text-primary">{customer.loyaltyPoints} pts</strong></span>
              <Badge variant="info">{customer.tier} Tier</Badge>
            </div>
          )}

          {/* Discount & Checkout Parameters */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground">Apply Discount</span>
              <div className="flex gap-1">
                <select
                  onChange={(e) => dispatch(setDiscount({ type: e.target.value, value: discount.value }))}
                  value={discount.type}
                  className="bg-card border border-border rounded-lg px-2 h-9 text-xs focus:outline-none"
                >
                  <option value="percent">%</option>
                  <option value="flat">$</option>
                </select>
                <input
                  type="number"
                  placeholder="0"
                  value={discount.value || ''}
                  onChange={(e) => dispatch(setDiscount({ type: discount.type, value: parseFloat(e.target.value) || 0 }))}
                  className="bg-card border border-border rounded-lg px-2 w-full h-9 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-medium text-muted-foreground">Cart Memo</span>
              <input
                type="text"
                placeholder="e.g. Gift wrapped..."
                value={notes}
                onChange={(e) => dispatch(setNotes(e.target.value))}
                className="bg-card border border-border rounded-lg px-3 h-9 text-xs focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Pricing Totals & Pay Actions */}
        <div className="p-4 border-t border-border bg-card space-y-4">
          <div className="space-y-1.5 text-sm text-muted-foreground font-semibold">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Discount Applied:</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sales Tax ({taxRate}%):</span>
              <span className="text-foreground">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-foreground border-t border-border/80 pt-2.5 mt-1.5">
              <span>Total Balance Due:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={items.length === 0}
              className="col-span-1 h-11 text-xs"
              onClick={handleHold}
            >
              Suspend
            </Button>
            <Button
              type="button"
              disabled={items.length === 0}
              className="col-span-2 h-11"
              onClick={() => setCheckoutOpen(true)}
            >
              Pay Checkout
            </Button>
          </div>
        </div>

      </div>

      {/* 1. SELECT VARIANT DIALOG MODAL */}
      <Dialog
        isOpen={!!variantProduct}
        onClose={() => setVariantProduct(null)}
        title={variantProduct ? `Select Variant: ${variantProduct.name}` : ''}
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Select storage, sizing, or styling option below to add to ticket.</p>
          <div className="flex flex-col gap-2">
            {variantProduct?.variants?.map((v) => (
              <button
                key={v.id}
                onClick={() => handleSelectVariant(v)}
                className="w-full flex items-center justify-between p-3.5 border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-bold text-foreground cursor-pointer text-left"
              >
                <span>{v.size}</span>
                <span className="text-primary">{formatCurrency(v.price)}</span>
              </button>
            ))}
          </div>
        </div>
      </Dialog>

      {/* 2. RECALL SUSPENDED TICKETS DIALOG MODAL */}
      <Dialog
        isOpen={heldOpen}
        onClose={() => setHeldOpen(false)}
        title="Recall Suspended Tickets"
        size="md"
      >
        <div className="space-y-4">
          {heldOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No active suspended tickets found.</p>
          ) : (
            <div className="divide-y divide-border">
              {heldOrders.map((o) => {
                const totalAmt = o.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                return (
                  <div key={o.id} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-extrabold text-primary">{o.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.customer ? `Customer: ${o.customer.name}` : 'Walk-In Customer'} • {o.items.length} items
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-foreground">{formatCurrency(totalAmt)}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          dispatch(recallHeldOrder(o.id));
                          setHeldOpen(false);
                        }}
                      >
                        Recall
                      </Button>
                      <button
                        onClick={() => dispatch(deleteHeldOrder(o.id))}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Dialog>

      {/* 3. CHECKOUT PAYMENT DRAWER DIALOG MODAL */}
      <Dialog
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Checkout Payment Processing"
        size="md"
      >
        <form onSubmit={handleCheckoutSubmit} className="space-y-6">
          
          <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Amount Due Balance</span>
            <h2 className="text-3xl font-black text-primary m-0">{formatCurrency(total)}</h2>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 cursor-pointer font-bold text-sm ${paymentMethod === 'Card' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:bg-secondary'}`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Credit/Debit</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 cursor-pointer font-bold text-sm ${paymentMethod === 'Cash' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:bg-secondary'}`}
              >
                <DollarSign className="h-5 w-5" />
                <span>Cash Drawer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Mobile')}
                className={`p-3.5 border rounded-xl flex flex-col items-center gap-2 cursor-pointer font-bold text-sm ${paymentMethod === 'Mobile' ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground hover:bg-secondary'}`}
              >
                <Smartphone className="h-5 w-5" />
                <span>Mobile Wallet</span>
              </button>
            </div>
          </div>

          {/* Cash input drawer fields */}
          {paymentMethod === 'Cash' && (
            <div className="space-y-4 border border-border p-4 rounded-xl bg-secondary/10 animate-slideDown">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  type="number"
                  step="0.01"
                  label="Cash Tendered Amount ($)"
                  placeholder="e.g. 50.00"
                  required
                />
                
                {/* Live Change Calculator */}
                <div className="flex flex-col justify-end text-right">
                  <span className="text-xs text-muted-foreground font-semibold">Change to Return</span>
                  <span className="text-xl font-bold text-emerald-500 mt-1">
                    {cashReceived && parseFloat(cashReceived) >= total 
                      ? formatCurrency(parseFloat(cashReceived) - total) 
                      : '$0.00'}
                  </span>
                </div>
              </div>

              {/* Quick Select Cash Options */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Quick Select Cash</span>
                <div className="flex gap-2 flex-wrap">
                  {[10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickCash(amt)}
                      className="px-3 py-1 bg-card hover:bg-secondary border border-border rounded-lg text-xs font-bold text-foreground cursor-pointer"
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleQuickCash(total)}
                    className="px-3 py-1 bg-card hover:bg-secondary border border-border rounded-lg text-xs font-bold text-foreground cursor-pointer"
                  >
                    Exact Change
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Footer Controls */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" icon={<CheckCircle2 className="h-4.5 w-4.5" />}>
              Process Checkout
            </Button>
          </div>

        </form>
      </Dialog>

      {/* 4. RECEIPT THERMAL PRINTER PREVIEW MODAL */}
      <Dialog
        isOpen={receiptOpen}
        onClose={() => {}}
        title="Thermal Receipt Print Preview"
        size="sm"
      >
        {checkoutInvoice && (
          <div className="space-y-6 flex flex-col items-center">
            
            {/* The Thermal paper ticket */}
            <div className="w-72 bg-white text-black p-5 shadow-sm border border-neutral-300 font-mono text-xs flex flex-col gap-3 rounded text-left">
              <div className="text-center space-y-1 border-b border-dashed border-neutral-400 pb-3">
                <h4 className="font-extrabold text-base tracking-wider">POS ENTERPRISE STORE</h4>
                <p className="text-[10px] text-neutral-600">100 E Chicago Ave, Chicago, IL</p>
                <p className="text-[10px] text-neutral-600">Tel: +1 (312) 555-0100</p>
              </div>

              {/* Header Info */}
              <div className="space-y-0.5 border-b border-dashed border-neutral-400 pb-2">
                <div className="flex justify-between">
                  <span>TICKET:</span>
                  <span>{checkoutInvoice.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{new Date(checkoutInvoice.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASHIER:</span>
                  <span>{checkoutInvoice.cashier.split(' ')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>CUSTOMER:</span>
                  <span className="truncate w-32 text-right">{checkoutInvoice.customerName}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 border-b border-dashed border-neutral-400 pb-2.5">
                <div className="flex justify-between font-bold border-b border-neutral-200 pb-1 text-[10px]">
                  <span>Item Description</span>
                  <span>Total</span>
                </div>
                {checkoutInvoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px] leading-tight">
                    <div className="w-48">
                      <p className="truncate font-bold">{item.product.name}</p>
                      <p className="text-[9px] text-neutral-600">
                        {item.quantity} x {item.price.toFixed(2)} {item.variant ? `(${item.variant.size})` : ''}
                      </p>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Invoice Totals */}
              <div className="space-y-1 border-b border-dashed border-neutral-400 pb-2.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${checkoutInvoice.subtotal.toFixed(2)}</span>
                </div>
                {checkoutInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Discount:</span>
                    <span>-${checkoutInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${checkoutInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-sm border-t border-neutral-200 pt-1.5 mt-0.5">
                  <span>TOTAL PAID:</span>
                  <span>${checkoutInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-0.5 text-[10px] text-neutral-600 border-b border-dashed border-neutral-400 pb-2">
                <div className="flex justify-between">
                  <span>PAYMENT MODE:</span>
                  <span>{checkoutInvoice.paymentMethod}</span>
                </div>
                {checkoutInvoice.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>CASH RECEIVED:</span>
                      <span>${checkoutInvoice.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-black">
                      <span>CHANGE RETURN:</span>
                      <span>${checkoutInvoice.changeDue.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Mock Barcode / Footer */}
              <div className="text-center pt-2 space-y-2">
                <p className="text-[10px] font-bold">THANK YOU FOR YOUR PATRONAGE!</p>
                <div className="inline-block bg-neutral-100 p-1.5 rounded">
                  <svg width="220" height="40" viewBox="0 0 240 50" className="text-black">
                    {/* Simulated barcode bars */}
                    {[10, 14, 20, 22, 28, 30, 36, 42, 44, 50, 52, 58, 64, 70, 72, 78, 80, 86, 92, 98, 100, 106, 112, 114, 120, 126, 128, 134, 140, 142, 148, 150, 156, 162, 168, 170, 176, 178, 184, 190, 192, 198, 204, 210, 212, 218, 220, 226].map((x, i) => (
                      <rect key={i} x={x} y={5} width={i % 3 === 0 ? 3 : 1} height={30} fill="currentColor" />
                    ))}
                  </svg>
                </div>
                <p className="text-[9px] text-neutral-500 font-mono tracking-widest">{checkoutInvoice.invoiceId}</p>
              </div>

            </div>

            <Button
              onClick={handlePrintReceipt}
              className="w-full justify-center"
              icon={<Printer className="h-4.5 w-4.5" />}
            >
              Print & Open Cash Drawer
            </Button>
          </div>
        )}
      </Dialog>

    </div>
  );
}

export default PosTerminal;
