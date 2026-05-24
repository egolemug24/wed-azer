'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PRODUCTS } from '@/lib/mock-data';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-ps-dark pt-10 pb-20 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: Package, label: "Products", active: false },
            { icon: ShoppingCart, label: "Orders", active: false },
            { icon: Users, label: "Customers", active: false },
            { icon: BarChart3, label: "Analytics", active: false },
            { icon: Settings, label: "Settings", active: false },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-4 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                item.active ? "bg-ps-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Admin Content */}
        <main className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="border-white/10 bg-ps-navy/40">Export data</Button>
              <Button className="bg-ps-blue hover:bg-ps-glow">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Revenue", val: "428,590 ₽", change: "+12.5%", positive: true },
              { label: "Total Orders", val: "1,245", change: "+5.2%", positive: true },
              { label: "Active Customers", val: "892", change: "-2.1%", positive: false },
              { label: "Avg. Order Value", val: "3,450 ₽", change: "+8.4%", positive: true },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/5">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-black">{stat.val}</h3>
                  <div className={`flex items-center text-xs font-bold ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Products Table (Simplified) */}
          <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">Recent Products</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-10 bg-ps-navy/40 border-white/5 h-9" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase bg-white/5 font-bold">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {PRODUCTS.slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-bold">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{p.price.toLocaleString()} ₽</td>
                      <td className="px-6 py-4">In Stock</td>
                      <td className="px-6 py-4">
                        <Badge className="bg-green-500/20 text-green-500 border-none px-3">Active</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
