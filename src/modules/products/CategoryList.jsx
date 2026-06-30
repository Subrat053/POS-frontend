import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  RefreshCw, 
  FileText, 
  FileSpreadsheet, 
  ChevronDown 
} from 'lucide-react';
import API from '../../services/api';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import toast from 'react-hot-toast';

export function CategoryList() {
  const { user } = useSelector((state) => state.auth);

  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!isEdit) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setSelectedId(null);
    setName('');
    setSlug('');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEdit(true);
    setSelectedId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setIsActive(cat.status === 'Active');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Category Name and Slug are required');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        status: isActive ? 'Active' : 'Inactive',
        user: user?.name || 'System'
      };

      if (isEdit) {
        await API.put(`/categories/${selectedId}`, payload);
        toast.success(`Category "${name}" updated!`);
      } else {
        await API.post('/categories', payload);
        toast.success(`Category "${name}" added successfully!`);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving category');
      console.error(error);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await API.delete(`/categories/${id}?user=${encodeURIComponent(user?.name || 'System')}`);
        toast.success('Category removed successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
        console.error(error);
      }
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Category</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your categories</p>
        </div>
        
        {/* Buttons on Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Export PDF">
            <FileText className="h-4.5 w-4.5 text-rose-500" />
          </button>
          <button className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Export Excel">
            <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500" />
          </button>
          <button onClick={fetchCategories} className="p-2 border border-border bg-card rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground hover:text-foreground" title="Refresh">
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {(user?.role === 'Super Admin' || user?.role === 'Store Manager') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md cursor-pointer transition-colors"
            >
              <Plus className="h-4.5 w-4.5" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Filter and Table Container */}
      <Card className="border border-border">
        <CardContent className="p-5 space-y-4">
          
          {/* Table Search & Status Filters */}
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
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden border border-border rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Category slug</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell>
                        <input type="checkbox" className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4" />
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell>
                        {new Date(cat.createdAt || Date.now()).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.status === 'Active' ? 'success' : 'secondary'}>
                          {cat.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(user?.role === 'Super Admin' || user?.role === 'Store Manager') && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(cat)}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border cursor-pointer transition-colors"
                                title="Edit Category"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg border border-border cursor-pointer transition-colors"
                                title="Delete Category"
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

      {/* ADD / EDIT CATEGORY MODAL DIALOG */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? "Edit Category" : "Add Category"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={handleNameChange}
            label="Category"
            placeholder="e.g. Computers"
            required
          />
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            label="Category Slug"
            placeholder="computers"
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
              {isEdit ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default CategoryList;
