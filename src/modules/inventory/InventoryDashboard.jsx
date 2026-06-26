import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Warehouse, 
  RefreshCw, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  HelpCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';
import { adjustProductStock, transferProductStock } from '../../app/slices/productsSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function InventoryDashboard() {
  const dispatch = useDispatch();
  const { products, stockAdjustments, transfers } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  const { availableStores } = useSelector((state) => state.settings);

  // Tabs: 'warehouse' | 'adjustments' | 'transfers'
  const [activeTab, setActiveTab] = useState('warehouse');

  // Modals
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Forms states
  const [adjProd, setAdjProd] = useState('');
  const [adjWarehouse, setAdjWarehouse] = useState('Chicago HQ');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('Recount');

  const [trfProd, setTrfProd] = useState('');
  const [trfFrom, setTrfFrom] = useState('Chicago HQ');
  const [trfTo, setTrfTo] = useState('New York Outlet');
  const [trfQty, setTrfQty] = useState('');

  // Dropdowns lists
  const warehouses = ['Chicago HQ', 'New York Outlet', 'San Francisco Branch'];
  const adjustmentReasons = ['Recount', 'Damaged stock', 'Stolen/Lost', 'Promo Gift', 'Restock restocked'];

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!adjProd || !adjQty) {
      toast.error('Please fill in all adjustment fields');
      return;
    }
    const qtyInt = parseInt(adjQty);
    if (isNaN(qtyInt) || qtyInt === 0) {
      toast.error('Adjustment quantity must be non-zero');
      return;
    }

    dispatch(adjustProductStock({
      productId: adjProd,
      warehouse: adjWarehouse,
      quantity: qtyInt,
      reason: adjReason,
      user: user?.name || 'Manager'
    }));

    toast.success('Stock adjustment completed');
    setAdjustOpen(false);
    setAdjQty('');
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!trfProd || !trfQty) {
      toast.error('Please fill in all transfer fields');
      return;
    }
    const qtyInt = parseInt(trfQty);
    if (isNaN(qtyInt) || qtyInt <= 0) {
      toast.error('Transfer quantity must be greater than 0');
      return;
    }
    if (trfFrom === trfTo) {
      toast.error('Source and Destination warehouse cannot be the same');
      return;
    }

    const matchedProd = products.find(p => p.id === trfProd);
    const sourceStock = matchedProd?.warehouseStock?.[trfFrom] || 0;
    if (sourceStock < qtyInt) {
      toast.error(`Insufficient stock in ${trfFrom} (Available: ${sourceStock})`);
      return;
    }

    dispatch(transferProductStock({
      productId: trfProd,
      fromWarehouse: trfFrom,
      toWarehouse: trfTo,
      quantity: qtyInt,
      user: user?.name || 'Manager'
    }));

    toast.success(`Transferred ${qtyInt} units of ${matchedProd.name}`);
    setTransferOpen(false);
    setTrfQty('');
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Inventory Control Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track multi-warehouse allocations, adjust discrepancies, and transfer stocks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={<ArrowLeftRight className="h-4 w-4" />}
            onClick={() => {
              if (products.length > 0) setTrfProd(products[0].id);
              setTransferOpen(true);
            }}
          >
            New Transfer
          </Button>
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              if (products.length > 0) setAdjProd(products[0].id);
              setAdjustOpen(true);
            }}
          >
            Log Adjustment
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'warehouse' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Warehouse Stock Levels
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'adjustments' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Adjustment Logs
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'transfers' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Warehouse Transfers
        </button>
      </div>

      {/* RENDER VIEWS */}
      {activeTab === 'warehouse' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <span>Multi-Warehouse Allocations</span>
            </CardTitle>
            <CardDescription>Product stock counts distributed by store warehouses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Chicago HQ</TableHead>
                    <TableHead>New York Outlet</TableHead>
                    <TableHead>San Francisco Branch</TableHead>
                    <TableHead className="font-bold text-foreground">Total Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const wStock = p.warehouseStock || {};
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                        <TableCell className="font-semibold">{wStock['Chicago HQ'] || 0}</TableCell>
                        <TableCell className="font-semibold">{wStock['New York Outlet'] || 0}</TableCell>
                        <TableCell className="font-semibold">{wStock['San Francisco Branch'] || 0}</TableCell>
                        <TableCell className="font-bold text-primary">{p.stock}</TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'In Stock' ? 'success' : p.status === 'Low Stock' ? 'warning' : 'destructive'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'adjustments' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span>Discrepancy adjustments Log</span>
            </CardTitle>
            <CardDescription>History of manual modifications made to item stock levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Log ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Adjusted Qty</TableHead>
                    <TableHead>Adjustment Reason</TableHead>
                    <TableHead>Date / Time</TableHead>
                    <TableHead>Logged By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAdjustments.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-bold text-primary">{log.id}</TableCell>
                      <TableCell>{log.productName}</TableCell>
                      <TableCell>{log.warehouse}</TableCell>
                      <TableCell className={`font-bold ${log.quantity > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {log.quantity > 0 ? `+${log.quantity}` : log.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(log.date)}</TableCell>
                      <TableCell className="font-semibold">{log.user}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'transfers' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              <span>Warehouse transfers Logs</span>
            </CardTitle>
            <CardDescription>History of internal inventory transfers between stores.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transfer ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Qty Transferred</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((trf) => (
                    <TableRow key={trf.id}>
                      <TableCell className="font-bold text-primary">{trf.id}</TableCell>
                      <TableCell>{trf.productName}</TableCell>
                      <TableCell>{trf.fromWarehouse}</TableCell>
                      <TableCell>{trf.toWarehouse}</TableCell>
                      <TableCell className="font-bold">{trf.quantity} units</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(trf.date)}</TableCell>
                      <TableCell>
                        <Badge variant="success">{trf.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. STOCK ADJUSTMENT FORM DIALOG MODAL */}
      <Dialog
        isOpen={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Log Inventory Stock Adjustment"
        size="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-foreground/80">Select Product</label>
            <select
              value={adjProd}
              onChange={(e) => setAdjProd(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Warehouse Location</label>
              <select
                value={adjWarehouse}
                onChange={(e) => setAdjWarehouse(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Adjustment Reason</label>
              <select
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {adjustmentReasons.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            value={adjQty}
            onChange={(e) => setAdjQty(e.target.value)}
            type="number"
            label="Adjustment Quantity (negative to subtract)"
            placeholder="e.g. -5 or 10"
            required
            helperText="Positive increments quantity; negative decrements quantity."
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdjustOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Apply Adjustment
            </Button>
          </div>

        </form>
      </Dialog>

      {/* 2. WAREHOUSE TRANSFER FORM DIALOG MODAL */}
      <Dialog
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Initiate Warehouse Stock Transfer"
        size="md"
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-foreground/80">Select Product</label>
            <select
              value={trfProd}
              onChange={(e) => setTrfProd(e.target.value)}
              className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Source Warehouse</label>
              <select
                value={trfFrom}
                onChange={(e) => setTrfFrom(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Destination Warehouse</label>
              <select
                value={trfTo}
                onChange={(e) => setTrfTo(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            value={trfQty}
            onChange={(e) => setTrfQty(e.target.value)}
            type="number"
            label="Transfer Quantity"
            placeholder="e.g. 5"
            required
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTransferOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Start Stock Transfer
            </Button>
          </div>

        </form>
      </Dialog>

    </div>
  );
}

export default InventoryDashboard;
