import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Barcode, Printer, HelpCircle, ShieldAlert } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export function BarcodeGenerator() {
  const { products } = useSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [labelQty, setLabelQty] = useState(10);

  const product = products.find(p => p.id === selectedProduct);
  const codeToGenerate = customText || product?.barcode || '1234567890';

  const handlePrint = () => {
    toast.success(`Sent print request for ${labelQty} labels of "${codeToGenerate}" to Zebra ZD410 printer!`);
  };

  // Dynamic SVG barcode renderer: simulates a barcode pattern of black and white stripes
  // derived from a hash of the code string to guarantee it looks unique per code.
  const generateBarcodePattern = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const binaryStr = Math.abs(hash).toString(2).padStart(32, '1').repeat(2);
    const bars = [];
    let position = 10;
    
    for (let i = 0; i < binaryStr.length && position < 290; i++) {
      const isBlack = binaryStr[i] === '1';
      // Vary the width slightly to make it look like a real barcode
      const width = (i % 3 === 0) ? 2 : (i % 5 === 0) ? 3 : 1; 
      
      if (isBlack) {
        bars.push(
          <rect
            key={i}
            x={position}
            y={10}
            width={width}
            height={60}
            fill="currentColor"
          />
        );
      }
      position += width + 1;
    }
    return bars;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Settings / Configuration Panel */}
      <Card className="lg:col-span-1 border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5 text-primary" />
            <span>Barcode Studio</span>
          </CardTitle>
          <CardDescription>Configure barcode labels for inventory products.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground/80">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCustomText(''); // reset custom text
              }}
              className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-px bg-border my-2" />
            <span className="text-xs text-muted-foreground text-center font-bold">OR USE CUSTOM CODE</span>
          </div>

          <Input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            label="Custom Barcode Content"
            placeholder="Type any SKU or code"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground/80">Barcode Type</label>
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
              >
                <option value="CODE128">Code 128</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC-A</option>
                <option value="CODE39">Code 39</option>
              </select>
            </div>

            <Input
              type="number"
              value={labelQty}
              onChange={(e) => setLabelQty(Math.max(1, parseInt(e.target.value) || 1))}
              label="Label Count"
            />
          </div>

          <Button
            onClick={handlePrint}
            className="w-full mt-4"
            icon={<Printer className="h-4.5 w-4.5" />}
          >
            Print Barcode Sheets
          </Button>

        </CardContent>
      </Card>

      {/* Label Preview Studio Panel */}
      <Card className="lg:col-span-2 border border-border">
        <CardHeader>
          <CardTitle>Label Layout Preview</CardTitle>
          <CardDescription>Live representation of the thermal label sheet print layout.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] bg-secondary/20 rounded-xl p-8 border border-dashed border-border/80">
          
          {/* Mock thermal label */}
          <div className="w-80 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-md rounded-lg p-6 flex flex-col items-center justify-between text-neutral-800 dark:text-neutral-100 min-h-[220px]">
            <div className="text-center w-full">
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/90">Store Tag: Chicago HQ</p>
              <h4 className="font-extrabold text-sm truncate mt-1">
                {customText ? 'Custom Label' : product?.name || 'Scan Item'}
              </h4>
              <p className="text-xs font-semibold text-primary mt-0.5">
                {customText ? 'SKU-CUSTOM' : product?.sku || 'SKU-000000'}
              </p>
            </div>

            {/* Generated Barcode SVG */}
            <div className="my-4 bg-white p-2 rounded border border-neutral-200">
              <svg
                width="280"
                height="80"
                viewBox="0 0 300 80"
                className="text-black"
              >
                {generateBarcodePattern(codeToGenerate)}
              </svg>
            </div>

            <div className="text-center w-full">
              <p className="font-mono text-sm font-bold tracking-[6px]">{codeToGenerate}</p>
              <div className="flex justify-between items-center mt-2 px-2 border-t border-neutral-100 pt-1 text-[10px] text-muted-foreground font-semibold">
                <span>FORMAT: {barcodeType}</span>
                <span>PRICE: {product ? `$${product.price}` : '$0.00'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2.5 text-xs text-muted-foreground max-w-sm">
            <HelpCircle className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Thermal print scaling automatically adjusts to standard 2" x 1.25" barcode label widths. Barcode pattern recalculates instantly when code string is edited.
            </p>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

export default BarcodeGenerator;
