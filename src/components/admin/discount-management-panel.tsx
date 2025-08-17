"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Trash2, Calendar, Package } from 'lucide-react';
import { useDiscounts } from '@/hooks/api/use-discounts';
import { CreateDiscountConfigData, UpdateDiscountConfigData } from '@/lib/services/discount-service';

interface DiscountFormData {
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minQuantity: string;
  maxQuantity: string;
  startDate: string;
  endDate: string;
}

const initialFormData: DiscountFormData = {
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minQuantity: '',
  maxQuantity: '',
  startDate: '',
  endDate: '',
};

export function DiscountManagementPanel() {
  const { discounts, isLoading, error, createDiscount, updateDiscount, deleteDiscount, toggleDiscountStatus } = useDiscounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [formData, setFormData] = useState<DiscountFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDiscount = async () => {
    setIsSubmitting(true);
    try {
      const discountData: CreateDiscountConfigData = {
        name: formData.name,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      const result = await createDiscount(discountData);
      if (result) {
        setIsCreateDialogOpen(false);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error creating discount:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDiscount = async () => {
    if (!editingDiscount) return;
    
    setIsSubmitting(true);
    try {
      const discountData: UpdateDiscountConfigData = {
        name: formData.name,
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minQuantity: formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
        maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      };

      const result = await updateDiscount(editingDiscount.id, discountData);
      if (result) {
        setIsEditDialogOpen(false);
        setEditingDiscount(null);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.error('Error updating discount:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (discount: any) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discountType: discount.discountType,
      discountValue: discount.discountValue.toString(),
      minQuantity: discount.minQuantity?.toString() || '',
      maxQuantity: discount.maxQuantity?.toString() || '',
      startDate: discount.startDate ? new Date(discount.startDate).toISOString().split('T')[0] : '',
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDiscount = async (id: string) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      await deleteDiscount(id);
    }
  };

  const formatDiscountValue = (discount: any) => {
    if (discount.discountType === 'PERCENTAGE') {
      return `${discount.discountValue}%`;
    }
    return `৳${discount.discountValue}`;
  };

  const getStatusBadge = (discount: any) => {
    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discount Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2">Loading discounts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discount Management</h2>
          <p className="text-muted-foreground">
            Configure bulk purchase discounts and promotional offers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Discount</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Discount Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bulk Purchase Discount"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Type</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') => 
                      setFormData(prev => ({ ...prev, discountType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="discountValue">
                    {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (৳)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minQuantity">Min Quantity</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="maxQuantity">Max Quantity</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDiscount}
                  disabled={isSubmitting || !formData.name || !formData.discountValue}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Discount'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {discounts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discounts configured yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first discount to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h4 className="font-medium">{discount.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {discount.description || 'No description'}
                        </p>
                      </div>
                      {getStatusBadge(discount)}
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Package className="h-4 w-4 mr-1" />
                        {formatDiscountValue(discount)}
                      </span>
                      {discount.minQuantity && (
                        <span>Min: {discount.minQuantity}</span>
                      )}
                      {discount.maxQuantity && (
                        <span>Max: {discount.maxQuantity}</span>
                      )}
                      {discount.startDate && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(discount.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={discount.isActive}
                      onCheckedChange={(checked) => toggleDiscountStatus(discount.id, checked)}
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDiscount(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Discount Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-discountType">Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') => 
                    setFormData(prev => ({ ...prev, discountType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-discountValue">
                  {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (৳)'}
                </Label>
                <Input
                  id="edit-discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-minQuantity">Min Quantity</Label>
                <Input
                  id="edit-minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-maxQuantity">Max Quantity</Label>
                <Input
                  id="edit-maxQuantity"
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditDiscount}
                disabled={isSubmitting || !formData.name || !formData.discountValue}
                className="flex-1"
              >
                {isSubmitting ? 'Updating...' : 'Update Discount'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 