"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavigation } from '@/components/admin';
import { MainContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadWithPreview } from '@/components/ui/image-upload-with-preview';
import { Plus, Package, DollarSign, Tag, Save } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  unit: string;
  unitSize: string;
  mrp: string;

  sellingPrice: string;
  minOrderQty: string;
  maxOrderQty: string;
  imageUrl: string;
  imagePublicId: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    unit: "",
    unitSize: "",
    mrp: "",

    sellingPrice: "",
    minOrderQty: "1",
    maxOrderQty: "",
    imageUrl: "",
    imagePublicId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageUpload = (imageUrl: string, publicId: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
      imagePublicId: publicId
    }));
  };

  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: "",
      imagePublicId: ""
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    setFormData(prev => ({
      ...prev,
      name,
      slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      router.push("/admin/products");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <AdminNavigation user={{ name: "Admin", role: "ADMIN" }} />

      <MainContainer className="max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">
              Create New{" "}
              <span className="bg-gradient-to-br from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Product
              </span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add a new product to your inventory with detailed information and images.
          </p>
        </div>

        <Card className="card-sohozdaam">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-6 w-6 text-primary mr-2" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Product Image */}
              <div className="space-y-2">
                <Label>Product Image</Label>
                <ImageUploadWithPreview
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  currentImageUrl={formData.imageUrl}
                  previewType="product"
                  previewData={{
                    name: formData.name,
                    description: formData.description,
                    category: categories.find(c => c.id === formData.categoryId)?.name,
                    price: parseFloat(formData.sellingPrice) || 0,
                    unit: formData.unit,
                    unitSize: formData.unitSize
                  }}
                />
                <p className="text-sm text-muted-foreground">
                  Upload a high-quality image for your product. Recommended size: 800x800px.
                </p>
              </div>

              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    placeholder="e.g., Basmati Rice"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., basmati-rice"
                  />
                  <p className="text-sm text-muted-foreground">
                    Auto-generated from product name
                  </p>
                </div>
              </div>

              {/* Category and Description */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Unit Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitSize">Unit Size *</Label>
                  <Input
                    id="unitSize"
                    type="number"
                    value={formData.unitSize}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitSize: e.target.value }))}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="e.g., 5.0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Size per unit (e.g., 5 kg per bag)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minOrderQty">Min Order Qty *</Label>
                  <Input
                    id="minOrderQty"
                    type="number"
                    value={formData.minOrderQty}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrderQty: e.target.value }))}
                    required
                    min="1"
                    placeholder="1"
                  />
                </div>
              </div>

              {/* Pricing Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP (৳) *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    value={formData.mrp}
                    onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 450.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maximum Retail Price
                  </p>
                </div>



                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price (৳) *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g., 420.00"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your selling price
                  </p>
                </div>
              </div>

              {/* Max Order Quantity */}
              <div className="space-y-2">
                <Label htmlFor="maxOrderQty">Maximum Order Quantity</Label>
                <Input
                  id="maxOrderQty"
                  type="number"
                  value={formData.maxOrderQty}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxOrderQty: e.target.value }))}
                  min="1"
                  placeholder="e.g., 100 (leave empty for unlimited)"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum quantity a customer can order (optional)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/admin/products">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </MainContainer>
    </div>
  );
} 