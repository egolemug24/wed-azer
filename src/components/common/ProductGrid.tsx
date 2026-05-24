'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/common/ProductCard';
import { PRODUCTS } from '@/lib/mock-data';
import Link from 'next/link';

interface ProductGridProps {
  title?: string;
  limit?: number;
}

export function ProductGrid({ title, limit }: ProductGridProps) {
  const displayProducts = limit ? PRODUCTS.slice(0, limit) : PRODUCTS;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
      {title && (
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-ps-blue rounded-full" />
            {title}
          </h2>
          <Link href="/catalog" className="text-ps-blue hover:text-ps-glow font-medium text-sm transition-colors shrink-0">
            Смотреть все →
          </Link>
        </div>
      )}

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6"
      >
        {displayProducts.map((product) => (
          <motion.div key={product.id} variants={item}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
