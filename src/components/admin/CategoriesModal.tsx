'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoriesModal({ isOpen, onClose }: CategoriesModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      if (!res.ok) throw new Error('Failed to create category');
      
      setNewCategory('');
      fetchCategories();
      toast.success('Категория добавлена!');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при добавлении категории');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${name}"? Все игры в ней станут "Без категории".`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete category');
      
      fetchCategories();
      toast.success('Категория удалена!');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при удалении категории');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-ps-dark/95 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Settings className="w-6 h-6 text-ps-blue" />
            Категории
          </h2>
          
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <Input 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              placeholder="Название новой категории..." 
              className="bg-white/5 border-white/10" 
              required 
            />
            <Button type="submit" disabled={loading} className="bg-ps-blue hover:bg-ps-glow shrink-0">
              <Plus className="w-4 h-4 mr-1" />
              Добавить
            </Button>
          </form>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg group">
                <span className="font-medium text-sm">{cat.name}</span>
                <button 
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                  title="Удалить категорию"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-white/50 py-4 text-sm">Нет категорий</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
