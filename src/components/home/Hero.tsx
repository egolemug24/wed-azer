'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BANNERS } from '@/lib/mock-data';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ 
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !w-12 !h-1 !rounded-full !bg-white/20"></span>`;
          }
        }}
        className="w-full h-full"
      >
        {BANNERS.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 scale-110 group-[.swiper-slide-active]:scale-100"
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-ps-dark via-ps-dark/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-ps-dark via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center px-4 lg:px-20 max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <motion.h1 
                    className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight leading-tight text-glow"
                  >
                    {banner.title.split(' ').map((word, i) => (
                      <span key={i} className={word.includes('подписки') || word.includes('FC') ? 'text-ps-blue' : ''}>
                        {word}{' '}
                      </span>
                    ))}
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-lg md:text-xl text-white/70 mb-8 font-medium"
                  >
                    {banner.subtitle}
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Link href={banner.cta1Href}>
                      <Button size="lg" className="bg-ps-blue hover:bg-ps-glow text-white px-8 h-12 text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                        {banner.cta1}
                      </Button>
                    </Link>
                    {banner.cta2 && (
                      <Link href={banner.cta2Href}>
                        <Button size="lg" variant="outline" className="border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 px-8 h-12 text-lg">
                          {banner.cta2}
                        </Button>
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Glow Decoration */}
              <div className="absolute top-1/4 -left-20 w-64 h-64 bg-ps-blue/20 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-ps-glow/10 blur-[150px] rounded-full pointer-events-none" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background: #3b82f6 !important;
          box-shadow: 0 0 10px #3b82f6;
          width: 2rem !important;
        }
      `}</style>
    </section>
  );
}
