import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FavoriteItem = {
  id: string; // Product ID or unique string for subscriptions
  name: string;
  price: number;
  image: string;
  category?: string;
  type?: 'product' | 'subscription';
};

interface FavoritesStore {
  items: FavoriteItem[];
  addItem: (item: FavoriteItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      hasItem: (id) => {
        return get().items.some((i) => i.id === id);
      },
      clearFavorites: () => set({ items: [] }),
    }),
    {
      name: 'gamerplus-favorites',
    }
  )
);
