import { create } from 'zustand';

interface AdminStore {
  editingProduct: any | null;
  setEditingProduct: (product: any | null) => void;
  editingSubscription: any | null;
  setEditingSubscription: (sub: any | null) => void;
}

export const useAdmin = create<AdminStore>((set) => ({
  editingProduct: null,
  setEditingProduct: (product) => set({ editingProduct: product }),
  editingSubscription: null,
  setEditingSubscription: (sub) => set({ editingSubscription: sub }),
}));
