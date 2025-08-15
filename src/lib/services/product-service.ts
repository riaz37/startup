import apiClient from '../api/api-client';
import { handleApiResponse, handleApiError } from '../api/api-client';
import { AxiosError } from 'axios';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters, 
  ProductsResponse 
} from '@/types';

export class ProductService {
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/api/products?${params.toString()}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/api/products/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getProductBySlug(slug: string): Promise<Product> {
    try {
      const response = await apiClient.get(`/api/products/slug/${slug}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async searchProducts(query: string): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get(`/api/products/search?q=${encodeURIComponent(query)}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async getProductsByCategory(categoryId: string): Promise<ProductsResponse> {
    try {
      const response = await apiClient.get(`/api/products/category/${categoryId}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.post('/api/products', data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
    try {
      const response = await apiClient.put(`/api/products/${id}`, data);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`/api/products/${id}`);
      return handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error as AxiosError);
    }
  }
}

export const productService = new ProductService(); 