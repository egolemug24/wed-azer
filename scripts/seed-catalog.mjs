import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    rating: 4.8
  },
  {
    name: "Spider-Man 2",
    description: "Продолжение приключений Питера Паркера.",
    price: 6999,
    discount: 0,
    image: "https://images.unsplash.com/photo-1612285330645-573574936657?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS5"],
    categoryName: "Экшен",
    rating: 4.9
  },
  {
    name: "God of War Ragnarok",
    description: "Эпическое завершение скандинавской саги.",
    price: 5999,
    discount: 30,
    image: "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS4", "PS5"],
    categoryName: "Приключения",
    rating: 5.0
  },
  {
    name: "Elden Ring",
    description: "Лучшая RPG последних лет.",
    price: 4999,
    discount: 15,
    image: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=2070&auto=format&fit=crop",
    platform: ["PS4", "PS5"],
    categoryName: "RPG",
    rating: 4.9
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

async function main() {
  // 1. Seed Categories
  const categoryIds = {};
  for (const catName of categories) {
    if (catName === "Все игры") continue; // We don't need a DB category for "All games"
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
        categoryId: categoryIds[prod.categoryName]
      }
    });
  }

  console.log('Catalog seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
