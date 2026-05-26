'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/store/use-admin';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SubscriptionModal() {
  const { editingSubscription, setEditingSubscription } = useAdmin();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        id: editingSubscription.id || '',
        name: editingSubscription.name || '',
        color: editingSubscription.color || 'bg-zinc-500',
        glow: editingSubscription.glow || 'shadow-[0_0_20px_rgba(113,113,122,0.3)]',
        price1: editingSubscription.price1 || 0,
        price3: editingSubscription.price3 || 0,
        price12: editingSubscription.price12 || 0,
        features: editingSubscription.features ? editingSubscription.features.join('\n') : '',
        popular: editingSubscription.popular || false,
        order: editingSubscription.order || 0,
        region: editingSubscription.region || 'TR',
        type: editingSubscription.type || 'PS_PLUS'
      });
    }
  }, [editingSubscription]);

  if (!editingSubscription || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: name.startsWith('price') || name === 'order' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const isNew = !formData.id;
      const method = isNew ? 'POST' : 'PATCH';
      
      const payload = {
        ...formData,
        features: formData.features.split('\n').filter((f: string) => f.trim() !== '')
      };

      const res = await fetch('/api/admin/subscriptions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save subscription');
      
      toast.success('Подписка успешно сохранена! Обновите страницу.');
      setEditingSubscription(null);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при сохранении подписки');
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
            onClick={() => setEditingSubscription(null)}
            className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6">{formData.id ? 'Редактирование подписки' : 'Новая подписка'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold">Название плана</label>
              <Input name="name" value={formData.name} onChange={handleChange} className="bg-white/5 border-white/10" required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Цена 1м / PS4 (₽)</label>
                <Input type="number" name="price1" value={formData.price1} onChange={handleChange} className="bg-white/5 border-white/10" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Цена 3м / PS5 (₽)</label>
                <Input type="number" name="price3" value={formData.price3} onChange={handleChange} className="bg-white/5 border-white/10" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Цена 1г / N/A (₽)</label>
                <Input type="number" name="price12" value={formData.price12} onChange={handleChange} className="bg-white/5 border-white/10" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/50 uppercase font-bold">Преимущества (каждое с новой строки)</label>
              <textarea 
                name="features" 
                value={formData.features} 
                onChange={handleChange} 
                className="w-full h-32 bg-white/5 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ps-blue" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Цвет (класс Tailwind)</label>
                <Input name="color" value={formData.color} onChange={handleChange} className="bg-white/5 border-white/10 text-xs" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Свечение (класс Tailwind)</label>
                <Input name="glow" value={formData.glow} onChange={handleChange} className="bg-white/5 border-white/10 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Регион</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ps-blue"
                >
                  <option value="TR">Турция (TR)</option>
                  <option value="UA">Украина (UA)</option>
                  <option value="ALL">Все / Шеринг (ALL)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase font-bold">Тип подписки</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white p-2 text-sm focus:outline-none focus:ring-1 focus:ring-ps-blue"
                >
                  <option value="PS_PLUS">PlayStation Plus</option>
                  <option value="EA_PLAY">EA Play</option>
                  <option value="P3_SHARING">П3 Шеринг</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="popular" checked={formData.popular} onChange={handleChange} className="w-4 h-4 rounded bg-white/5 border-white/10 text-ps-blue" />
                <span className="text-sm font-bold text-white/80">Популярный план (Рекомендуем)</span>
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-6 bg-ps-blue hover:bg-ps-glow text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] h-12"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Сохранение...' : 'Сохранить подписку'}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
