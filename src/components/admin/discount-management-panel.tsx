"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Calendar, Package, BarChart3, Download, Upload, Filter } from 'lucide-react';
import { useDiscounts } from '@/hooks/api/use-discounts';
import { toast } from 'sonner';

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
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [formData, setFormData] = useState<DiscountFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<'activate' | 'deactivate' | 'delete'>('activate');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter discounts based on current filters
  const filteredDiscounts = discounts.filter(discount => {
    if (filterType !== 'all' && discount.discountType !== filterType) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && !discount.isActive) return false;
      if (filterStatus === 'inactive' && discount.isActive) return false;
      if (filterStatus === 'expired' && (!discount.endDate || new Date(discount.endDate) >= new Date())) return false;
      if (filterStatus === 'scheduled' && (!discount.startDate || new Date(discount.startDate) <= new Date())) return false;
    }
    return true;
  });

  const handleCreateDiscount = async () => {
    setIsSubmitting(true);
    try {
      const discountData = {
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
        toast.success('Discount created successfully');
      }
    } catch (error) {
      toast.error('Failed to create discount');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDiscount = async () => {
    if (!editingDiscount) return;
    
    setIsSubmitting(true);
    try {
      const discountData = {
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
        toast.success('Discount updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update discount');
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
      try {
        await deleteDiscount(id);
        toast.success('Discount deleted successfully');
      } catch (error) {
        toast.error('Failed to delete discount');
      }
    }
  };

  const handleBulkOperation = async () => {
    if (selectedDiscounts.length === 0) {
      toast.error('Please select at least one discount');
      return;
    }

    if (bulkOperation === 'delete' && !confirm(`Are you sure you want to delete ${selectedDiscounts.length} discount(s)?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/discounts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: bulkOperation,
          discountIds: selectedDiscounts
        })
      });

      if (response.ok) {
        toast.success(`Bulk operation completed successfully`);
        setSelectedDiscounts([]);
        setIsBulkDialogOpen(false);
        // Refresh discounts
        window.location.reload();
      } else {
        throw new Error('Bulk operation failed');
      }
    } catch (error) {
      toast.error('Failed to perform bulk operation');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(filteredDiscounts.map(d => d.id));
    } else {
      setSelectedDiscounts([]);
    }
  };

  const handleSelectDiscount = (discountId: string, checked: boolean) => {
    if (checked) {
      setSelectedDiscounts(prev => [...prev, discountId]);
    } else {
      setSelectedDiscounts(prev => prev.filter(id => id !== discountId));
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

  const exportDiscounts = () => {
    const csvContent = [
      ['Name', 'Description', 'Type', 'Value', 'Min Quantity', 'Max Quantity', 'Start Date', 'End Date', 'Status'],
      ...filteredDiscounts.map(d => [
        d.name,
        d.description || '',
        d.discountType,
        d.discountValue,
        d.minQuantity || '',
        d.maxQuantity || '',
        d.startDate ? new Date(d.startDate).toLocaleDateString() : '',
        d.endDate ? new Date(d.endDate).toLocaleDateString() : '',
        d.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'discounts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportDiscounts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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
      </div>

      {/* Filters and Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters & Bulk Actions</CardTitle>
            {selectedDiscounts.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedDiscounts.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkDialogOpen(true)}
                >
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-type">Type:</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="filter-status">Status:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Discounts ({filteredDiscounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {filteredDiscounts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No discounts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {discounts.length === 0 ? 'Create your first discount to get started' : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Row */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
                <Checkbox
                  checked={selectedDiscounts.length === filteredDiscounts.length}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>
              
              {filteredDiscounts.map((discount) => (
                <div
                  key={discount.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg"
                >
                  <Checkbox
                    checked={selectedDiscounts.includes(discount.id)}
                    onCheckedChange={(checked) => handleSelectDiscount(discount.id, checked as boolean)}
                  />
                  
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

      {/* Bulk Operations Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Operations</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Operation</Label>
              <Select value={bulkOperation} onValueChange={(value: any) => setBulkOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">
                This will {bulkOperation} {selectedDiscounts.length} discount(s).
                {bulkOperation === 'delete' && ' This action cannot be undone.'}
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBulkDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkOperation}
                variant={bulkOperation === 'delete' ? 'destructive' : 'default'}
                className="flex-1"
              >
                {bulkOperation === 'activate' && 'Activate'}
                {bulkOperation === 'deactivate' && 'Deactivate'}
                {bulkOperation === 'delete' && 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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