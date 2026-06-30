import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  Upload 
} from 'lucide-react';
import API from '../../services/api';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import toast from 'react-hot-toast';

export function BrandList() {
  const { user } = useSelector((state) => state.auth);

  // States
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await API.get('/brands');
      setBrands(response.data);
    } catch (error) {
      toast.error('Failed to load brands');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedId(null);
    setName('');
    setImage('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setIsEdit(true);
    setSelectedId(brand.id);
    setName(brand.name);
    setImage(brand.image || '');
    setIsActive(brand.status === 'Active');
    setModalOpen(true);
  };

  const handleImageUploadDummy = () => {
    // Generate a beautiful, high-quality, default image URL for the brand
    const randomKeywords = ['tech', 'style', 'logo', 'brand', 'sneaker', 'office', 'audio'];
    const keyword = randomKeywords[Math.floor(Math.random() * randomKeywords.length)];
    const url = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 5000000)}?w=100&h=100&fit=crop&q=80&sig=${Math.floor(Math.random() * 1000)}`;
    setImage(url);
    toast.success('Brand image simulated successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Brand Name is required');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        image: image || undefined,
        status: isActive ? 'Active' : 'Inactive',
        user: user?.name || 'System'
      };

      if (isEdit) {
        await API.put(`/brands/${selectedId}`, payload);
        toast.success(`Brand "${name}" updated!`);
      } else {
        await API.post('/brands', payload);
        toast.success(`Brand "${name}" added successfully!`);
      }
      setModalOpen(false);
      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving brand');
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      try {
        await API.delete(`/brands/${id}?user=${encodeURIComponent(user?.name || 'System')}`);
        toast.success('Brand removed successfully');
        fetchBrands();
      } catch (error) {
        toast.error('Failed to delete brand');
        console.error(error);
      }
    }
  };

  // Filter & Sort Brands
  let filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (sortBy === 'latest') {
    filteredBrands.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === 'oldest') {
    filteredBrands.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === 'alphabetical') {
    filteredBrands.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Brand</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your brands</p>
        </div>
        
        {/* Buttons on Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Export PDF">
            <FileText className="h-4.5 w-4.5 text-rose-500" />
          </button>
          <button className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Export Excel">
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
          </button>
          <button onClick={fetchBrands} className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Refresh">
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {(user?.role === 'Super Admin' || user?.role === 'Store Manager') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Brand
            </button>
          )}
        </div>
      </div>

      {/* Filter and Table Container */}
      <Card className="border border-border">
        <CardContent className="p-5 space-y-4">
          
          {/* Table Search & Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="w-full sm:max-w-xs relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                icon={<Search className="h-4 w-4" />}
                className="h-9"
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary w-full sm:w-32"
              >
                <option value="">Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary w-full sm:w-36"
              >
                <option value="latest">Sort By: Latest</option>
                <option value="oldest">Sort By: Oldest</option>
                <option value="alphabetical">Sort By: A-Z</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden border border-border rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading brands...
                    </TableCell>
                  </TableRow>
                ) : filteredBrands.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No brands found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBrands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4" />
                      </TableCell>
                      <TableCell className="flex items-center gap-3">
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="h-8 w-8 rounded-lg border border-border object-cover bg-secondary"
                        />
                        <span className="font-bold text-foreground">{brand.name}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(brand.createdAt || Date.now()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={brand.status === 'Active' ? 'success' : 'secondary'}>
                          {brand.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(user?.role === 'Super Admin' || user?.role === 'Store Manager') && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(brand)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border cursor-pointer transition-colors"
                                title="Edit Brand"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(brand.id, brand.name)}
                                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg border border-border cursor-pointer transition-colors"
                                title="Delete Brand"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>

      {/* ADD / EDIT BRAND MODAL DIALOG */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Edit Brand" : "Add Brand"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Image Upload Area */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-foreground/80">Brand Logo</label>
            <div className="flex items-center gap-4">
              <div className="border border-dashed border-border rounded-xl h-24 w-24 flex flex-col items-center justify-center bg-secondary/15 relative overflow-hidden">
                {image ? (
                  <img src={image} alt="Brand preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                    <Award className="h-6 w-6 mb-1 text-muted-foreground" />
                    <span>+ Add Image</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleImageUploadDummy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Image
                </button>
                <p className="text-[10px] text-muted-foreground">JPEG, PNG up to 2 MB</p>
              </div>
            </div>
          </div>

          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Brand"
            placeholder="e.g. Nike"
            required
          />

          {/* Status Toggle Switch */}
          <div className="flex items-center justify-between text-left py-2 border-t border-b border-border">
            <span className="text-sm font-medium text-foreground">Status</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2.5 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
            >
              {isEdit ? "Save Changes" : "Add Brand"}
            </button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default BrandList;
