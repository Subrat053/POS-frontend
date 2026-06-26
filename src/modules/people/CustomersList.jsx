import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  History, 
  Award, 
  Mail, 
  Phone,
  UserPlus
} from 'lucide-react';
import { addCustomer, deleteCustomer } from '../../app/slices/peopleSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { MOCK_ORDERS } from '../../services/mockApi';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export function CustomersList() {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.people);
  const { user } = useSelector((state) => state.auth);

  // States
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Silver');
  const [points, setPoints] = useState(0);

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter customer name and email');
      return;
    }

    dispatch(addCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      tier,
      loyaltyPoints: parseInt(points) || 0
    }));

    toast.success('Loyalty Customer Registered');
    setCreateOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setTier('Silver');
    setPoints(0);
  };

  const handleDelete = (id) => {
    if (confirm('Delete customer account? Loyalty points accrued will be lost.')) {
      dispatch(deleteCustomer(id));
      toast.success('Customer profile deleted');
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search));
    const matchesTier = tierFilter === '' || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Filter mock orders for history
  const customerOrders = historyCustomer 
    ? MOCK_ORDERS.filter(o => o.customerName.toLowerCase() === historyCustomer.name.toLowerCase()) 
    : [];

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Customers Registry</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage customer loyalty points and order history records.</p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, phone..."
            icon={<Search className="h-4.5 w-4.5" />}
            className="h-9"
          />
          <div className="flex items-center">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Tiers</option>
              <option value="VIP">VIP Tier</option>
              <option value="Platinum">Platinum Tier</option>
              <option value="Gold">Gold Tier</option>
              <option value="Silver">Silver Tier</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-bold">
          Total Registered: {customers.length} Profiles
        </div>
      </div>

      {/* Main Customers List Card */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email Contact</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Points Accrued</TableHead>
                <TableHead>Loyalty Tier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No customer accounts matched search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-foreground">{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone || 'N/A'}</TableCell>
                    <TableCell className="font-bold text-primary">{c.loyaltyPoints} pts</TableCell>
                    <TableCell>
                      <Badge variant={c.tier === 'VIP' ? 'default' : c.tier === 'Platinum' ? 'info' : c.tier === 'Gold' ? 'warning' : 'secondary'}>
                        {c.tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setHistoryCustomer(c)}
                          className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                          title="Purchase History"
                        >
                          <History className="h-4.5 w-4.5" />
                        </button>
                        {user?.role !== 'Cashier' && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 1. REGISTER CUSTOMER MODAL */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register Loyalty Customer Account"
        size="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Full Customer Name"
            placeholder="e.g. Clark Kent"
            required
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            label="Email Address"
            placeholder="clark@dailyplanet.com"
            required
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            label="Telephone Number"
            placeholder="+1 312-555-0144"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Loyalty Tier Status</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                <option value="Silver">Silver Tier</option>
                <option value="Gold">Gold Tier</option>
                <option value="Platinum">Platinum Tier</option>
                <option value="VIP">VIP Tier</option>
              </select>
            </div>

            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
              label="Starting Loyalty Points"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Register Account
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. TRANSACTION HISTORY DRAWER MODAL */}
      <Dialog
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={historyCustomer ? `Transaction History: ${historyCustomer.name}` : ''}
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3 text-sm text-muted-foreground font-semibold">
            <Award className="h-4.5 w-4.5 text-primary" />
            <span>Tier: {historyCustomer?.tier} • Loyalty Balance: {historyCustomer?.loyaltyPoints} pts</span>
          </div>

          {customerOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No historical orders found matching name.</p>
          ) : (
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date / Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-bold text-primary">{o.id}</TableCell>
                      <TableCell>{o.items} items</TableCell>
                      <TableCell className="font-semibold text-foreground">{formatCurrency(o.total)}</TableCell>
                      <TableCell>{o.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="success">Completed</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setHistoryCustomer(null)}>
              Close
            </Button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}

export default CustomersList;
