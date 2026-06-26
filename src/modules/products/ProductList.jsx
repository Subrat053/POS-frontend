import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Download, 
  Upload, 
  Eye, 
  Edit3, 
  Trash2, 
  Barcode,
  Layers,
  ChevronDown,
  ArrowUpDown,
  Filter,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { bulkDeleteProducts, deleteProduct, addProduct } from '../../app/slices/productsSlice';
import Button from '../../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Dialog from '../../components/ui/Dialog';
import Input from '../../components/ui/Input';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

// Sub Tab Views
import CategoriesBrands from './CategoriesBrands';
import BarcodeGenerator from './BarcodeGenerator';

export function ProductList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, categories } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  // Tabs: 'catalog' | 'categories' | 'barcodes'
  const [activeTab, setActiveTab] = useState('catalog');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Column Visibility state
  const [visibleCols, setVisibleCols] = useState({
    sku: true,
    barcode: true,
    category: true,
    brand: true,
    price: true,
    cost: true,
    tax: true,
    stock: true,
    status: true
  });
  const [showColMenu, setShowColMenu] = useState(false);

  // Row Selection state
  const [selectedRows, setSelectedRows] = useState([]);

  // Import Modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchesCat = selectedCat === '' || p.category === selectedCat;
    const matchesStatus = selectedStatus === '' || p.status === selectedStatus;
    
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    if (typeof valA === 'string') {
      return sortOrder === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    }
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  // Paginated products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rId => rId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.length === currentProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentProducts.map(p => p.id));
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      setSelectedRows(selectedRows.filter(rId => rId !== id));
      toast.success('Product deleted successfully');
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete the ${selectedRows.length} selected products?`)) {
      dispatch(bulkDeleteProducts(selectedRows));
      setSelectedRows([]);
      toast.success('Selected products deleted');
    }
  };

  const handleExportCSV = () => {
    const listToExport = selectedRows.length > 0 
      ? products.filter(p => selectedRows.includes(p.id)) 
      : sortedProducts;

    const headers = 'ID,Name,SKU,Barcode,Category,Brand,Price,Cost,Stock,Status\n';
    const rows = listToExport.map(p => 
      `"${p.id}","${p.name}","${p.sku}","${p.barcode}","${p.category}","${p.brand}",${p.price},${p.cost},${p.stock},"${p.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `POS-Catalog-Export-${Date.now()}.csv`);
    a.click();
    toast.success(`Exported ${listToExport.length} items to CSV file`);
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please choose a CSV file to import');
      return;
    }
    
    // Simulate loading and parsing file
    toast.loading('Processing CSV import file...');
    setTimeout(() => {
      toast.dismiss();
      
      // Add a couple of mock products to simulate parsed CSV
      dispatch(addProduct({
        name: 'Smart Security Camera 4K',
        sku: 'SEC-CAM-4K',
        barcode: '304918273699',
        category: 'Electronics',
        brand: 'Sony',
        price: 199.99,
        cost: 110.00,
        tax: 8.25,
        stock: 15,
        minStock: 3,
        variants: []
      }));
      dispatch(addProduct({
        name: 'Office Ergonomic Pad',
        sku: 'FUR-PAD-01',
        barcode: '205349182399',
        category: 'Furniture',
        brand: 'Steelcase',
        price: 49.00,
        cost: 20.00,
        tax: 5.00,
        stock: 35,
        minStock: 10,
        variants: []
      }));

      setImportOpen(false);
      setImportFile(null);
      toast.success('Successfully imported 2 products from CSV');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-1">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'catalog' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Products Catalog
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Categories & Brands
          </button>
          <button
            onClick={() => setActiveTab('barcodes')}
            className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'barcodes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Barcode Studio
          </button>
        </div>
        
        {activeTab === 'catalog' && (
          <div className="flex items-center gap-2 mb-2 sm:mb-0">
            <Button
              variant="outline"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => setImportOpen(true)}
            >
              Import CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={handleExportCSV}
            >
              Export
            </Button>
            {user?.role !== 'Cashier' && (
              <Link to="/products/new">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                  Add Product
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* View Router */}
      {activeTab === 'categories' && <CategoriesBrands />}
      {activeTab === 'barcodes' && <BarcodeGenerator />}
      
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search and Filters */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, SKUs, barcode..."
                icon={<Search className="h-4.5 w-4.5" />}
                className="h-9"
              />
              
              <div className="flex items-center">
                <select
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Layout Toggles & Column Visibility */}
            <div className="flex items-center justify-end gap-3 flex-shrink-0">
              
              {/* Column Visibility Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  icon={<Layers className="h-4 w-4" />}
                  onClick={() => setShowColMenu(!showColMenu)}
                >
                  Columns
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
                {showColMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1 text-left">
                    <h5 className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase border-b border-border mb-1">Visible Columns</h5>
                    {Object.keys(visibleCols).map((col) => (
                      <label key={col} className="flex items-center gap-2 p-1.5 rounded hover:bg-secondary cursor-pointer text-xs text-foreground capitalize">
                        <input
                          type="checkbox"
                          checked={visibleCols[col]}
                          onChange={() => setVisibleCols({ ...visibleCols, [col]: !visibleCols[col] })}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{col === 'minStock' ? 'Min Stock' : col}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center border border-border rounded-lg p-0.5 bg-secondary/30">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'table' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Bulk Actions Console */}
          {selectedRows.length > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-center justify-between animate-fadeIn text-sm">
              <span className="font-semibold text-primary">
                {selectedRows.length} products selected for action
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-primary/30 hover:bg-primary/10 text-primary"
                  onClick={handleExportCSV}
                >
                  Export Selected
                </Button>
                {user?.role !== 'Cashier' && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-8 text-xs"
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    onClick={handleBulkDelete}
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Catalog Render Panel */}
          {filteredProducts.length === 0 ? (
            <Card className="border-dashed border-2 p-12 text-center">
              <p className="text-sm text-muted-foreground">No products found matching the criteria.</p>
            </Card>
          ) : viewMode === 'table' ? (
            
            /* Table Layout */
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <Table>
                <TableHeader className="sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedRows.length === currentProducts.length && currentProducts.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Product Name</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    {visibleCols.sku && (
                      <TableHead className="cursor-pointer" onClick={() => handleSort('sku')}>
                        <div className="flex items-center gap-1">
                          <span>SKU</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                    )}
                    {visibleCols.barcode && <TableHead>Barcode</TableHead>}
                    {visibleCols.category && <TableHead>Category</TableHead>}
                    {visibleCols.brand && <TableHead>Brand</TableHead>}
                    {visibleCols.price && (
                      <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                        <div className="flex items-center gap-1">
                          <span>Price</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                    )}
                    {visibleCols.cost && <TableHead>Cost</TableHead>}
                    {visibleCols.tax && <TableHead>Tax</TableHead>}
                    {visibleCols.stock && (
                      <TableHead className="cursor-pointer" onClick={() => handleSort('stock')}>
                        <div className="flex items-center gap-1">
                          <span>Stock</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                    )}
                    {visibleCols.status && <TableHead>Status</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((p) => {
                    const isSelected = selectedRows.includes(p.id);
                    return (
                      <TableRow key={p.id} selected={isSelected}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(p.id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                        {visibleCols.sku && <TableCell className="font-mono text-xs">{p.sku}</TableCell>}
                        {visibleCols.barcode && <TableCell className="text-xs font-medium text-muted-foreground">{p.barcode}</TableCell>}
                        {visibleCols.category && <TableCell>{p.category}</TableCell>}
                        {visibleCols.brand && <TableCell>{p.brand}</TableCell>}
                        {visibleCols.price && <TableCell className="font-semibold">{formatCurrency(p.price)}</TableCell>}
                        {visibleCols.cost && <TableCell className="text-muted-foreground">{formatCurrency(p.cost)}</TableCell>}
                        {visibleCols.tax && <TableCell className="text-muted-foreground">{p.tax}%</TableCell>}
                        {visibleCols.stock && (
                          <TableCell className="font-bold">
                            {p.stock} <span className="text-[10px] font-normal text-muted-foreground">left</span>
                          </TableCell>
                        )}
                        {visibleCols.status && (
                          <TableCell>
                            <Badge variant={p.status === 'In Stock' ? 'success' : p.status === 'Low Stock' ? 'warning' : 'destructive'}>
                              {p.status}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedCat('');
                                setSearch(p.barcode);
                                setActiveTab('barcodes');
                              }}
                              className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                              title="Generate Barcode"
                            >
                              <Barcode className="h-4 w-4" />
                            </button>
                            {user?.role !== 'Cashier' && (
                              <>
                                <Link to={`/products/edit/${p.id}`}>
                                  <button
                                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            
            /* Grid Layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                const pct = p.stock === 0 ? 0 : Math.min(100, (p.stock / (p.minStock * 3)) * 100);
                return (
                  <Card key={p.id} hoverable className="overflow-hidden flex flex-col justify-between">
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant={p.status === 'In Stock' ? 'success' : p.status === 'Low Stock' ? 'warning' : 'destructive'}>
                            {p.status}
                          </Badge>
                          <p className="text-[10px] font-mono text-muted-foreground mt-1.5">{p.sku}</p>
                        </div>
                        <h4 className="text-lg font-black text-foreground">{formatCurrency(p.price)}</h4>
                      </div>

                      <h3 className="font-bold text-foreground text-md truncate leading-tight">{p.name}</h3>

                      <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                        <span>Brand: <strong className="text-foreground">{p.brand}</strong></span>
                        <span>Cat: <strong className="text-foreground">{p.category}</strong></span>
                      </div>

                      {/* Stock Level Bar Indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Stock: {p.stock} units</span>
                          <span className="text-[10px] text-muted-foreground">Min Alert: {p.minStock}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${p.stock === 0 ? 'bg-destructive' : isLow ? 'bg-amber-500' : 'bg-primary'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3.5 bg-secondary/30 border-t border-border flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedCat('');
                          setSearch(p.barcode);
                          setActiveTab('barcodes');
                        }}
                        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline cursor-pointer"
                      >
                        <Barcode className="h-4 w-4" />
                        <span>Barcode</span>
                      </button>
                      
                      {user?.role !== 'Cashier' && (
                        <div className="flex items-center gap-1.5">
                          <Link to={`/products/edit/${p.id}`}>
                            <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-card cursor-pointer">
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/80 pt-4 text-sm text-muted-foreground">
              <span>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === i + 1 ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* CSV Import Modal Dialog */}
      <Dialog
        isOpen={importOpen}
        onClose={() => { setImportOpen(false); setImportFile(null); }}
        title="Import Catalog via CSV"
        size="md"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download our standard CSV format template. Upload your spreadsheet containing fields for Name, SKU, Barcode, price, and initial warehouse quantities.
          </p>

          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors p-6 rounded-xl flex flex-col items-center justify-center bg-secondary/10 cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-2" />
            <span className="text-sm font-semibold text-foreground">
              {importFile ? importFile.name : 'Click to select CSV spreadsheet'}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Maximum file size: 5MB</span>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setImportOpen(false); setImportFile(null); }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Import and Sync Catalog
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default ProductList;
