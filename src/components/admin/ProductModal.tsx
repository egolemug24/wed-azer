'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/store/use-admin';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ProductModal() {
  const { editingProduct, setEditingProduct } = useAdmin();
  const [formData, setFormData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/categories');
      if (res.ok) {
        setCategories(await res.json());
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price,
        discount: editingProduct.discount,
        image: editingProduct.image,
        categoryId: editingProduct.categoryId || '',
        platforms: editingProduct.platform || ['PS5'],
        isNew: editingProduct.isNew || false
      });
    }
  }, [editingProduct]);

  if (!editingProduct || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: name === 'price' || name === 'discount' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isNew = formData.isNew;
      const res = await fetch('/api/admin/products', {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          price: Number(formData.price) || 0,
          discount: Number(formData.discount) || 0,
          image: formData.image,
          categoryId: formData.categoryId,
          platforms: formData.platforms
        })
      });

      if (!res.ok) throw new Error('Failed to update product');
      
      toast.success('Товар успешно обновлен! Обновите страницу чтобы увидеть изменения.');
      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при обновлении товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-ps-dark/95 border border-white/10 p-6 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={() => setEditingProduct(null)}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6">
            {formData.isNew ? 'Добавление товара' : 'Редактирование товара'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-32 h-40 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 flex flex-col items-center justify-center">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/20" />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-white/50 uppercase font-bold">Название</label>
                  <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="bg-white/5 border-white/10" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-white/50 uppercase font-bold">Ссылка на фото (URL)</label>
                  <Input 
                    name="image" 
                    value={formData.image} 
                    onChange={handleChange} 
                    className="bg-white/5 border-white/10 text-xs" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Цена (₽)</label>
                <Input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  className="bg-white/5 border-white/10" 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Скидка (%)</label>
                <Input 
                  type="number" 
                  name="discount" 
                  value={formData.discount} 
                  onChange={handleChange} 
                  className="bg-white/5 border-white/10" 
                  min="0" max="100" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Категория</label>
                <select
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={(e) => setFormData((p: any) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full h-10 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-ps-blue appearance-none"
                  required
                >
                  <option value="" disabled className="text-black">
                    {categories.length === 0 ? "⚠️ Сначала создайте категории" : "Выберите категорию"}
                  </option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id} className="text-black">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/50 uppercase font-bold">Платформы</label>
                <div className="flex gap-4 items-center h-10">
                  {['PS4', 'PS5'].map(platform => (
                    <label key={platform} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-white/10 bg-white/5 text-ps-blue focus:ring-ps-blue"
                        checked={formData.platforms.includes(platform)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData((p: any) => ({
                            ...p,
                            platforms: checked 
                              ? [...p.platforms, platform] 
                              : p.platforms.filter((x: string) => x !== platform)
                          }));
                        }}
                      />
                      <span className="text-sm">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-ps-blue hover:bg-ps-glow text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
