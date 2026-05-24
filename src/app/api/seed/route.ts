import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const categories = [
  "Все игры", "Экшен", "RPG", "Спорт", "Приключения", "Хоррор", "Симуляторы"
];

const mockProducts = [
  {
    name: "EA SPORTS FC 25",
    description: "Собери команду мечты.",
    price: 8999,
    discount: 10,
    image: "https://images.unsplash.com/photo-1628277613967-6abca504d0ac?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS4", "PS5"],
    categoryName: "Спорт",
    rating: 4.8,
    isNew: true
  },
  {
    name: "Spider-Man 2",
    description: "Продолжение приключений Питера Паркера.",
    price: 6999,
    discount: 0,
    image: "https://images.unsplash.com/photo-1612285330645-573574936657?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS5"],
    categoryName: "Экшен",
    rating: 4.9,
    isNew: false
  },
  {
    name: "God of War Ragnarok",
    description: "Эпическое завершение скандинавской саги.",
    price: 5999,
    discount: 30,
    image: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS4", "PS5"],
    categoryName: "Приключения",
    rating: 5.0,
    isNew: false
  },
  {
    name: "Elden Ring",
    description: "Лучшая RPG последних лет.",
    price: 4999,
    discount: 15,
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS4", "PS5"],
    categoryName: "RPG",
    rating: 4.9,
    isNew: true
  }
];

const mockSubscriptions = [
  {
    name: "PlayStation Plus Essential",
    description: "Ежемесячные игры, сетевая игра, эксклюзивные скидки.",
    prices: {
      "1": 999,
      "3": 2499,
      "12": 6999
    },
    features: [
      "Доступ к сетевому мультиплееру",
      "2-3 игры каждый месяц",
      "Эксклюзивные скидки в PS Store",
      "Облачное хранилище для сохранений"
    ],
    popular: false,
    color: "gray"
  },
  {
    name: "PlayStation Plus Extra",
    description: "Всё из Essential + каталог из сотен игр для PS4 и PS5.",
    prices: {
      "1": 1499,
      "3": 3999,
      "12": 10999
    },
    features: [
      "Всё из тарифа Essential",
      "Каталог из 400+ игр для PS4/PS5",
      "Игры Ubisoft+ Classics"
    ],
    popular: true,
    color: "blue"
  },
  {
    name: "PlayStation Plus Deluxe",
    description: "Максимальный уровень. Каталог классики и демоверсии новинок.",
    prices: {
      "1": 1799,
      "3": 4999,
      "12": 12999
    },
    features: [
      "Всё из тарифа Extra",
      "Каталог классических игр",
      "Демоверсии новых игр"
    ],
    popular: false,
    color: "purple"
  }
];

function generateSlug(name) {
  const ru = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 
    'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 
    'щ': 'sch', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '-', 'В': 'v', 'Э': 'e', 'С': 's', 'Р': 'r'
  };
  return name.toLowerCase().split('').map(char => ru[char] || char).join('').replace(/[^a-z0-9-]/g, '');
}

export async function GET() {
  try {
    // 1. Seed Categories
    const categoryIds = {};
    for (const catName of categories) {
      if (catName === "Все игры") continue;
      const cat = await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: {
          name: catName,
          slug: generateSlug(catName)
        }
      });
      categoryIds[catName] = cat.id;
    }

    // 2. Clear old products to avoid duplicates
    await prisma.product.deleteMany({});

    // 3. Seed Products
    for (const prod of mockProducts) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          discount: prod.discount,
          image: prod.image,
          rating: prod.rating,
          platform: prod.platform,
          isNew: prod.isNew,
          categoryId: categoryIds[prod.categoryName]
        }
      });
    }

    // 4. Seed Subscriptions
    await prisma.subscriptionPlan.deleteMany({});
    
    for (const sub of mockSubscriptions) {
      await prisma.subscriptionPlan.create({
        data: {
          name: sub.name,
          description: sub.description,
          features: sub.features,
          isPopular: sub.popular,
          colorTheme: sub.color,
          prices: {
            create: Object.entries(sub.prices).map(([duration, price]) => ({
              durationMonths: parseInt(duration),
              price: price
            }))
          }
        }
      });
    }

    return NextResponse.json({ success: true, message: 'Database seeded perfectly!' });
  } catch (error) {
    console.error('Error seeding:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
