import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Settings as SettingsIcon, Save, Store, Receipt, HelpCircle, ShieldAlert } from 'lucide-react';
import { updateStoreSettings } from '../../app/slices/settingsSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import toast from 'react-hot-toast';

const settingsSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(6, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Please enter a valid storefront address'),
  defaultTaxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
  currencyCode: z.string().min(3, 'Please select a currency'),
  receiptHeader: z.string().min(3, 'Receipt header text must be at least 3 characters')
});

export function Settings() {
  const dispatch = useDispatch();
  const { storeSettings } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: storeSettings.name,
      email: storeSettings.email,
      phone: storeSettings.phone,
      address: storeSettings.address,
      defaultTaxRate: storeSettings.defaultTaxRate,
      currencyCode: storeSettings.currencyCode,
      receiptHeader: storeSettings.receiptHeader
    }
  });

  const onSubmit = (data) => {
    setSaving(true);
    setTimeout(() => {
      dispatch(updateStoreSettings(data));
      setSaving(false);
      toast.success('Store settings saved successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Store Configurations</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure general store details, tax levels, currencies, and print layouts.</p>
      </div>

      {user?.role !== 'Super Admin' && user?.role !== 'Store Manager' ? (
        <Card className="border border-destructive/20 bg-destructive/5 p-6 flex gap-3 items-center">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <div>
            <p className="font-bold text-foreground">Access Restricted</p>
            <p className="text-xs text-muted-foreground">Only Store Managers and Super Admins can alter system configurations.</p>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form details */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md font-bold">
                  <Store className="h-4 w-4 text-primary" />
                  <span>Store Profile</span>
                </CardTitle>
                <CardDescription>Primary store details linked to transaction receipts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  {...register('name')}
                  label="Business Name"
                  error={errors.name?.message}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('email')}
                    label="Corporate Email"
                    type="email"
                    error={errors.email?.message}
                  />
                  <Input
                    {...register('phone')}
                    label="Telephone"
                    error={errors.phone?.message}
                  />
                </div>

                <Input
                  {...register('address')}
                  label="Physical Address"
                  error={errors.address?.message}
                />
              </CardContent>
            </Card>

            {/* Financial Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md font-bold">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span>Taxes & Currency</span>
                </CardTitle>
                <CardDescription>Configure localization preferences.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-sm font-medium text-foreground/80">Primary Currency</label>
                  <select
                    {...register('currencyCode')}
                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                  {errors.currencyCode && <p className="text-xs text-destructive font-semibold">{errors.currencyCode.message}</p>}
                </div>

                <Input
                  {...register('defaultTaxRate')}
                  type="number"
                  step="0.01"
                  label="Default Sales Tax Rate (%)"
                  error={errors.defaultTaxRate?.message}
                  helperText="Standard sales tax applied at checkout checkout"
                />

              </CardContent>
            </Card>

            {/* Receipt Styling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md font-bold">Receipt Ticket Layout</CardTitle>
                <CardDescription>Configure printed paper details.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  {...register('receiptHeader')}
                  label="Receipt Header Brand Banner"
                  error={errors.receiptHeader?.message}
                  helperText="Uppercase headline text printed at the absolute top of invoices"
                />
              </CardContent>
            </Card>

          </div>

          {/* Action trigger columns */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-md font-bold">Save Settings</CardTitle>
                <CardDescription>Commit changes to local system registries.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  className="w-full justify-center"
                  loading={saving}
                  icon={<Save className="h-4 w-4" />}
                >
                  Save Store Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Configuration Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <div className="flex gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  <p>Changes are saved globally and will be immediately synced across all active cash registers and invoice printing modules.</p>
                </div>
              </CardContent>
            </Card>
          </div>

        </form>
      )}

    </div>
  );
}

export default Settings;
