import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Trash2, FolderOpen, Award } from 'lucide-react';
import { addCategory, deleteCategory, addBrand, deleteBrand } from '../../app/slices/productsSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import toast from 'react-hot-toast';

export function CategoriesBrands() {
  const dispatch = useDispatch();
  const { categories, brands, products } = useSelector((state) => state.products);

  const [newCat, setNewCat] = useState('');
  const [newBrand, setNewBrand] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (categories.includes(newCat.trim())) {
      toast.error('Category already exists');
      return;
    }
    dispatch(addCategory(newCat.trim()));
    toast.success(`Category "${newCat}" added!`);
    setNewCat('');
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrand.trim()) return;
    if (brands.includes(newBrand.trim())) {
      toast.error('Brand already exists');
      return;
    }
    dispatch(addBrand(newBrand.trim()));
    toast.success(`Brand "${newBrand}" added!`);
    setNewBrand('');
  };

  const handleDeleteCategory = (cat) => {
    // Check if category is used by any products
    const inUse = products.some(p => p.category === cat);
    if (inUse) {
      toast.error(`Cannot delete category "${cat}" because it is currently assigned to products`);
      return;
    }
    dispatch(deleteCategory(cat));
    toast.success(`Category "${cat}" removed`);
  };

  const handleDeleteBrand = (brand) => {
    const inUse = products.some(p => p.brand === brand);
    if (inUse) {
      toast.error(`Cannot delete brand "${brand}" because it is currently assigned to products`);
      return;
    }
    dispatch(deleteBrand(brand));
    toast.success(`Brand "${brand}" removed`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      {/* Categories Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <span>Categories</span>
            </h3>
            <p className="text-xs text-muted-foreground">Manage product classification structures.</p>
          </div>
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 items-end bg-card border border-border p-4 rounded-xl shadow-sm">
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Groceries"
            className="h-9"
          />
          <Button type="submit" size="sm" icon={<Plus className="h-4 w-4" />}>
            Add
          </Button>
        </form>

        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Products Linked</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <TableRow key={cat}>
                    <TableCell className="font-semibold">{cat}</TableCell>
                    <TableCell>{count} products</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Brands Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Brands</span>
            </h3>
            <p className="text-xs text-muted-foreground">Manage authorized store labels & brands.</p>
          </div>
        </div>

        <form onSubmit={handleAddBrand} className="flex gap-2 items-end bg-card border border-border p-4 rounded-xl shadow-sm">
          <Input
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            placeholder="e.g. Nike"
            className="h-9"
          />
          <Button type="submit" size="sm" icon={<Plus className="h-4 w-4" />}>
            Add
          </Button>
        </form>

        <div className="border border-border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Products Linked</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => {
                const count = products.filter(p => p.brand === brand).length;
                return (
                  <TableRow key={brand}>
                    <TableCell className="font-semibold">{brand}</TableCell>
                    <TableCell>{count} products</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDeleteBrand(brand)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

    </div>
  );
}

export default CategoriesBrands;
