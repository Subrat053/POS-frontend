import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Truck, 
  Plus, 
  Trash2, 
  CheckCircle, 
  PackageCheck, 
  FileText, 
  Building2, 
  UserPlus 
} from 'lucide-react';
import { 
  addSupplier, 
  deleteSupplier, 
  createPurchaseOrder, 
  approvePurchaseOrder, 
  receivePurchaseOrder 
} from '../../app/slices/procurementSlice';
import { receiveStockFromPO } from '../../app/slices/productsSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function PurchasesDashboard() {
  const dispatch = useDispatch();
  
  const { suppliers, purchaseOrders } = useSelector((state) => state.procurement);
  const { products } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  // Tabs: 'po' | 'suppliers'
  const [activeTab, setTab] = useState('po');

  // Modals
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [poOpen, setPoOpen] = useState(false);
  const [detailPo, setDetailPo] = useState(null);

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');

  // PO Form
  const [poSupplier, setPoSupplier] = useState(suppliers[0]?.id || '');
  const [poWarehouse, setPoWarehouse] = useState('Chicago HQ');
  const [poItems, setPoItems] = useState([{ productId: products[0]?.id || '', quantity: 1, costPrice: products[0]?.cost || 0 }]);

  // Add Supplier
  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!supName.trim() || !supEmail.trim()) {
      toast.error('Please fill in name and email');
      return;
    }
    dispatch(addSupplier({
      name: supName.trim(),
      email: supEmail.trim(),
      phone: supPhone.trim(),
      address: supAddress.trim()
    }));
    toast.success('Supplier registered');
    setSupplierOpen(false);
    setSupName('');
    setSupEmail('');
    setSupPhone('');
    setSupAddress('');
  };

  // Add PO item row
  const addPoItemRow = () => {
    setPoItems([...poItems, { productId: products[0]?.id || '', quantity: 1, costPrice: products[0]?.cost || 0 }]);
  };

  // Update PO item row
  const updatePoItemRow = (idx, field, value) => {
    const copy = [...poItems];
    if (field === 'productId') {
      const match = products.find(p => p.id === value);
      copy[idx] = {
        productId: value,
        quantity: copy[idx].quantity,
        costPrice: match ? match.cost : 0
      };
    } else {
      copy[idx][field] = value;
    }
    setPoItems(copy);
  };

  // Remove PO item row
  const removePoItemRow = (idx) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== idx));
  };

  // Create PO
  const handleCreatePO = (e) => {
    e.preventDefault();
    const activeSupplier = suppliers.find(s => s.id === poSupplier);
    if (!activeSupplier) {
      toast.error('Please select a supplier');
      return;
    }

    const items = poItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Unknown Product',
        quantity: parseInt(item.quantity) || 1,
        costPrice: parseFloat(item.costPrice) || 0
      };
    });

    const totalAmount = items.reduce((acc, i) => acc + (i.costPrice * i.quantity), 0);

    dispatch(createPurchaseOrder({
      supplierId: poSupplier,
      supplierName: activeSupplier.name,
      warehouse: poWarehouse,
      items,
      totalAmount
    }));

    toast.success('Purchase Order Created');
    setPoOpen(false);
    setPoItems([{ productId: products[0]?.id || '', quantity: 1, costPrice: products[0]?.cost || 0 }]);
  };

  // Approve PO
  const handleApprovePO = (poId) => {
    dispatch(approvePurchaseOrder(poId));
    toast.success(`Purchase Order ${poId} approved by manager`);
  };

  // Receive PO
  const handleReceivePO = (po) => {
    dispatch(receivePurchaseOrder(po.id));
    
    // Increment product quantities in productsSlice
    const stockItems = po.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    }));
    
    dispatch(receiveStockFromPO({
      items: stockItems,
      warehouse: po.warehouse
    }));

    toast.success(`Stock received successfully for ${po.id}!`);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Procurements & Purchases</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage purchase orders and supplier catalogs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => setSupplierOpen(true)}
          >
            Add Supplier
          </Button>
          {user?.role !== 'Cashier' && (
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => {
                if (suppliers.length > 0) setPoSupplier(suppliers[0].id);
                setPoOpen(true);
              }}
            >
              Create Purchase Order
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border pb-1">
        <button
          onClick={() => setTab('po')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'po' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Purchase Orders
        </button>
        <button
          onClick={() => setTab('suppliers')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'suppliers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Supplier Contacts
        </button>
      </div>

      {/* VIEW PANEL ROUTER */}
      {activeTab === 'po' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Restock Orders Logs</span>
            </CardTitle>
            <CardDescription>Issue and track restock orders sent to suppliers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Deliver To</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Date Issued</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-bold text-primary">{po.id}</TableCell>
                      <TableCell className="font-semibold">{po.supplierName}</TableCell>
                      <TableCell>{po.warehouse}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(po.totalAmount)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(po.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={po.status === 'Received' ? 'success' : po.status === 'Approved' ? 'info' : 'warning'}>
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailPo(po)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
                            title="View PO Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          
                          {/* Approval Trigger */}
                          {po.status === 'Pending' && user?.role === 'Super Admin' && (
                            <button
                              onClick={() => handleApprovePO(po.id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg cursor-pointer"
                              title="Approve Order"
                            >
                              <CheckCircle className="h-4.5 w-4.5" />
                            </button>
                          )}

                          {/* Receive Inventory Trigger */}
                          {po.status === 'Approved' && user?.role !== 'Cashier' && (
                            <button
                              onClick={() => handleReceivePO(po)}
                              className="p-1 text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                              title="Receive Inventory Stock"
                            >
                              <PackageCheck className="h-4.5 w-4.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'suppliers' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>Authorized Store Suppliers</span>
            </CardTitle>
            <CardDescription>Supplier registries used for procuring warehouse inventories.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier ID</TableHead>
                    <TableHead>Supplier Name</TableHead>
                    <TableHead>Email Contact</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Address Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-bold text-primary">{s.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{s.address}</TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => {
                            dispatch(deleteSupplier(s.id));
                            toast.success('Supplier removed');
                          }}
                          className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. ADD SUPPLIER MODAL */}
      <Dialog
        isOpen={supplierOpen}
        onClose={() => setSupplierOpen(false)}
        title="Register New Wholesale Supplier"
        size="md"
      >
        <form onSubmit={handleAddSupplier} className="space-y-4">
          <Input
            value={supName}
            onChange={(e) => setSupName(e.target.value)}
            label="Supplier Company Name"
            placeholder="e.g. Samsung Logistics"
            required
          />
          <Input
            value={supEmail}
            onChange={(e) => setSupEmail(e.target.value)}
            type="email"
            label="Corporate Email Address"
            placeholder="orders@supplier.com"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={supPhone}
              onChange={(e) => setSupPhone(e.target.value)}
              label="Contact Phone"
              placeholder="+1 800-555-0199"
            />
            <Input
              value={supAddress}
              onChange={(e) => setSupAddress(e.target.value)}
              label="HQ Physical Address"
              placeholder="e.g. Cupertino, CA"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSupplierOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Register Supplier
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. CREATE PURCHASE ORDER MODAL */}
      <Dialog
        isOpen={poOpen}
        onClose={() => setPoOpen(false)}
        title="Generate Purchase Order Restock Ticket"
        size="lg"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Select Supplier</label>
              <select
                value={poSupplier}
                onChange={(e) => setPoSupplier(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Deliver To Warehouse</label>
              <select
                value={poWarehouse}
                onChange={(e) => setPoWarehouse(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                <option value="Chicago HQ">Chicago HQ</option>
                <option value="New York Outlet">New York Outlet</option>
                <option value="San Francisco Branch">San Francisco Branch</option>
              </select>
            </div>
          </div>

          {/* PO items list builder */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase">Restock Items List</span>
              <Button type="button" variant="outline" size="sm" onClick={addPoItemRow}>
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {poItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end border border-border/80 bg-secondary/10 p-3 rounded-lg">
                  <div className="flex-1 flex flex-col gap-1 text-left">
                    <label className="text-xs text-muted-foreground">Product</label>
                    <select
                      value={item.productId}
                      onChange={(e) => updatePoItemRow(idx, 'productId', e.target.value)}
                      className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updatePoItemRow(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                      label="Quantity"
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      step="0.01"
                      value={item.costPrice}
                      onChange={(e) => updatePoItemRow(idx, 'costPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                      label="Buy Cost ($)"
                      className="h-9 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePoItemRow(idx)}
                    className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer h-9 flex items-center justify-center border border-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPoOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Submit Purchase Order
            </Button>
          </div>

        </form>
      </Dialog>

      {/* 3. VIEW PO DETAIL DIALOG */}
      <Dialog
        isOpen={!!detailPo}
        onClose={() => setDetailPo(null)}
        title={detailPo ? `Purchase Order Details: ${detailPo.id}` : ''}
        size="md"
      >
        {detailPo && (
          <div className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-3">
              <div>
                <p className="font-bold uppercase text-[10px] text-muted-foreground mb-1">Supplier info</p>
                <p className="font-bold text-sm text-foreground">{detailPo.supplierName}</p>
                <p className="text-muted-foreground mt-0.5">PO status: <strong>{detailPo.status}</strong></p>
              </div>
              <div className="text-right">
                <p className="font-bold uppercase text-[10px] text-muted-foreground mb-1">Shipping Target</p>
                <p className="font-bold text-sm text-foreground">{detailPo.warehouse}</p>
                <p className="text-muted-foreground mt-0.5">Issued: {new Date(detailPo.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold uppercase text-[10px] text-muted-foreground border-b border-border pb-1">Items list</p>
              <div className="divide-y divide-border/60">
                {detailPo.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between">
                    <div>
                      <p className="font-bold text-foreground">{item.productName}</p>
                      <p className="text-muted-foreground">{item.quantity} units x {formatCurrency(item.costPrice)}</p>
                    </div>
                    <span className="font-bold text-foreground">{formatCurrency(item.costPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3 flex justify-between text-sm font-bold text-foreground">
              <span>Estimated PO total:</span>
              <span className="text-primary">{formatCurrency(detailPo.totalAmount)}</span>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setDetailPo(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}

export default PurchasesDashboard;
