import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Plus, Trash2, Tag, Percent, Layers, ShieldCheck } from 'lucide-react';
import { addProduct, updateProduct } from '../../app/slices/productsSlice';
import API from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  barcode: z.string().min(8, 'Barcode must be at least 8 digits').max(13, 'Barcode max 13 digits'),
  category: z.string().min(1, 'Please select a category'),
  brand: z.string().min(1, 'Please select a brand'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  cost: z.coerce.number().min(0, 'Cost cannot be negative'),
  tax: z.coerce.number().min(0, 'Tax rate cannot be negative'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  minStock: z.coerce.number().int().min(1, 'Min stock warning must be at least 1')
});

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, categories, brands } = useSelector((state) => state.products);

  const isEdit = !!id;
  const existingProduct = isEdit ? products.find(p => p.id === id) : null;

  const [variants, setVariants] = useState(existingProduct?.variants || []);
  const [vSize, setVSize] = useState('');
  const [vPrice, setVPrice] = useState('');

  const [saving, setSaving] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbBrands, setDbBrands] = useState([]);

  useEffect(() => {
    const loadSelections = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          API.get('/categories'),
          API.get('/brands')
        ]);
        // Filter only Active categories & brands
        setDbCategories(catRes.data.filter(c => c.status === 'Active'));
        setDbBrands(brandRes.data.filter(b => b.status === 'Active'));
      } catch (err) {
        console.error('Failed to load categories/brands for product form', err);
      }
    };
    loadSelections();
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      barcode: '',
      category: '',
      brand: '',
      price: '',
      cost: '',
      tax: 8.25,
      stock: 0,
      minStock: 5
    }
  });

  useEffect(() => {
    if (isEdit && existingProduct) {
      setValue('name', existingProduct.name);
      setValue('sku', existingProduct.sku);
      setValue('barcode', existingProduct.barcode);
      setValue('category', existingProduct.category);
      setValue('brand', existingProduct.brand);
      setValue('price', existingProduct.price);
      setValue('cost', existingProduct.cost);
      setValue('tax', existingProduct.tax);
      setValue('stock', existingProduct.stock);
      setValue('minStock', existingProduct.minStock);
      setVariants(existingProduct.variants || []);
    }
  }, [isEdit, existingProduct, setValue]);

  const onSubmit = (data) => {
    setSaving(true);
    
    // Simulate API delay
    setTimeout(() => {
      const payload = {
        ...data,
        variants
      };

      if (isEdit) {
        dispatch(updateProduct({ id, ...payload }));
        toast.success('Product updated successfully!');
      } else {
        dispatch(addProduct(payload));
        toast.success('Product created successfully!');
      }
      setSaving(false);
      navigate('/products');
    }, 800);
  };

  const handleAddVariant = (e) => {
    e.preventDefault();
    if (!vSize.trim() || !vPrice) return;
    const priceNum = parseFloat(vPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Variant price must be greater than 0');
      return;
    }
    const newVariant = {
      id: `var-${Date.now()}`,
      size: vSize.trim(),
      price: priceNum
    };
    setVariants([...variants, newVariant]);
    setVSize('');
    setVPrice('');
    toast.success('Variant added to list');
  };

  const handleRemoveVariant = (varId) => {
    setVariants(variants.filter(v => v.id !== varId));
  };

  const generateRandomBarcode = () => {
    const num = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setValue('barcode', num);
    toast.success('Generated barcode!');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-2 border border-border bg-card hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4.5 w-4.5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight m-0">
            {isEdit ? 'Edit Product SKU' : 'Add New Product'}
          </h1>
          <p className="text-xs text-muted-foreground">Define identifiers, prices, categories, and inventory configurations.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Form Inputs */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-bold">
                <Tag className="h-4 w-4 text-primary" />
                <span>Basic Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register('name')}
                label="Product Name"
                placeholder="e.g. iPad Air 256GB"
                error={errors.name?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  {...register('sku')}
                  label="SKU Code"
                  placeholder="e.g. TAB-IPA-256"
                  error={errors.sku?.message}
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Barcode (UPC/EAN)</label>
                  <div className="flex gap-2">
                    <Input
                      {...register('barcode')}
                      placeholder="e.g. 194253847291"
                      error={errors.barcode?.message}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateRandomBarcode}
                      className="h-10 text-xs px-2.5"
                    >
                      Gen
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground/80">Category</label>
                  <select
                    {...register('category')}
                    className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Category</option>
                    {dbCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-destructive font-semibold">{errors.category.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground/80">Brand</label>
                  <select
                    {...register('brand')}
                    className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="">Select Brand</option>
                    {dbBrands.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                  {errors.brand && <p className="text-xs text-destructive font-semibold">{errors.brand.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing & Tax */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-bold">
                <Percent className="h-4 w-4 text-primary" />
                <span>Financial & Taxation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <Input
                {...register('price')}
                type="number"
                step="0.01"
                label="Sell Price ($)"
                placeholder="299.99"
                error={errors.price?.message}
              />
              <Input
                {...register('cost')}
                type="number"
                step="0.01"
                label="Acquisition Cost ($)"
                placeholder="150.00"
                error={errors.cost?.message}
              />
              <Input
                {...register('tax')}
                type="number"
                step="0.01"
                label="Tax Rate (%)"
                placeholder="8.25"
                error={errors.tax?.message}
              />
            </CardContent>
          </Card>

          {/* Section 3: Inventory Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md font-bold">
                <Layers className="h-4 w-4 text-primary" />
                <span>Inventory Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Input
                {...register('stock')}
                type="number"
                label="Initial Stock Quantity"
                placeholder="10"
                error={errors.stock?.message}
                disabled={isEdit} // Adjusting stock during edit should be done via stock adjustments
                helperText={isEdit ? "Stock levels are updated via adjustments/POs" : "Starting quantity in primary warehouse"}
              />
              <Input
                {...register('minStock')}
                type="number"
                label="Reorder Alert Threshold"
                placeholder="5"
                error={errors.minStock?.message}
                helperText="Triggers low stock warnings when catalog levels drop below this value"
              />
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Variants and Save Actions */}
        <div className="space-y-6">
          
          {/* Action Trigger Card */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-md font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full justify-center"
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                {isEdit ? 'Save Changes' : 'Publish Product'}
              </Button>
              <Link to="/products" className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Variants Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md font-bold">Product Variants</CardTitle>
              <CardDescription>Configure sizes, storage tiers, or colors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="space-y-2 border border-border p-3 rounded-lg bg-secondary/20">
                <Input
                  value={vSize}
                  onChange={(e) => setVSize(e.target.value)}
                  label="Variant Descriptor"
                  placeholder="e.g. 512GB Black"
                  className="h-9"
                />
                <Input
                  type="number"
                  value={vPrice}
                  onChange={(e) => setVPrice(e.target.value)}
                  label="Variant Price ($)"
                  placeholder="e.g. 349.99"
                  className="h-9"
                />
                <Button
                  onClick={handleAddVariant}
                  variant="outline"
                  size="sm"
                  className="w-full justify-center mt-2 h-9"
                  icon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add Variant Option
                </Button>
              </div>

              {/* Variants Listing */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {variants.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No variant rules configured</p>
                ) : (
                  variants.map((v) => (
                    <div key={v.id} className="flex justify-between items-center border border-border/80 bg-card p-2 rounded-lg text-xs">
                      <div>
                        <p className="font-bold text-foreground truncate w-28">{v.size}</p>
                        <p className="text-muted-foreground font-semibold">${v.price.toFixed(2)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.id)}
                        className="p-1 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </CardContent>
          </Card>

        </div>

      </form>
    </div>
  );
}

export default ProductForm;
