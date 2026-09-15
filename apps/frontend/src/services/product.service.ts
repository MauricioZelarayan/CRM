import { api } from './api';

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number | string;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface DealProductItem {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreateProductDTO {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  active?: boolean;
}

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get<{ data: Product[] }>('/products');
    return res.data.data;
  },

  create: async (data: CreateProductDTO): Promise<Product> => {
    const res = await api.post<{ message: string; data: Product }>('/products', data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  setDealProducts: async (dealId: string, items: DealProductItem[]): Promise<void> => {
    await api.put(`/products/deals/${dealId}/items`, { items });
  },
};