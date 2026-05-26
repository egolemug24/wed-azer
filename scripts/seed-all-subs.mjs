import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  // Turkey PS Plus
  {
    name: "Essential",
    color: "bg-zinc-500",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.3)]",
    price1: 1300,
    price3: 2890,
    price12: 5890,
    features: [ "Ежемесячные игры", "Сетевая игра", "Эксклюзивные скидки", "Облачное хранилище" ],
    region: "TR",
    type: "PS_PLUS",
    order: 1
  },
  {
    name: "Extra",
    color: "bg-yellow-500",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    price1: 1690,
    price3: 4090,
    price12: 9300,
    features: [ "Все из Essential", "Каталог игр (400+ игр)", "Ubisoft+ Classics" ],
    popular: true,
    region: "TR",
    type: "PS_PLUS",
    order: 2
  },
  {
    name: "Deluxe",
    color: "bg-ps-blue",
    glow: "shadow-[0_0_20px_rgba(37,99,235,0.4)]",
    price1: 1990,
    price3: 4390,
    price12: 11000,
    features: [ "Все из Extra", "Каталог классики", "Пробные версии игр" ],
    region: "TR",
    type: "PS_PLUS",
    order: 3
  },

  // Ukraine PS Plus
  {
    name: "Essential",
    color: "bg-zinc-500",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.3)]",
    price1: 900,
    price3: 1990,
    price12: 3700,
    features: [ "Ежемесячные игры", "Сетевая игра", "Эксклюзивные скидки", "Облачное хранилище" ],
    region: "UA",
    type: "PS_PLUS",
    order: 1
  },
  {
    name: "Extra",
    color: "bg-yellow-500",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    price1: 1190,
    price3: 2890,
    price12: 5190,
    features: [ "Все из Essential", "Каталог игр (400+ игр)", "Ubisoft+ Classics" ],
    popular: true,
    region: "UA",
    type: "PS_PLUS",
    order: 2
  },
  {
    name: "Deluxe",
    color: "bg-ps-blue",
    glow: "shadow-[0_0_20px_rgba(37,99,235,0.4)]",
    price1: 1390,
    price3: 2990,
    price12: 5990,
    features: [ "Все из Extra", "Каталог классики", "Пробные версии игр" ],
    region: "UA",
    type: "PS_PLUS",
    order: 3
  },

  // EA Play Turkey
  {
    name: "EA Play",
    color: "bg-red-500",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    price1: 550, // 890р без скидки, 550р по акции
    price3: 2100,
    price12: 3990,
    features: [ "Доступ к библиотеке лучших игр EA", "Скидка 10% на цифровые покупки EA", "Ранний доступ к новинкам (пробные версии до 10 часов)" ],
    region: "TR",
    type: "EA_PLAY",
    order: 4
  },

  // EA Play Ukraine
  {
    name: "EA Play",
    color: "bg-red-500",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    price1: 550, // 790р без скидки, 550р по акции
    price3: 1700,
    price12: 2390,
    features: [ "Доступ к библиотеке лучших игр EA", "Скидка 10% на цифровые покупки EA", "Ранний доступ к новинкам (пробные версии до 10 часов)" ],
    region: "UA",
    type: "EA_PLAY",
    order: 4
  },

  // P3 Sharing
  {
    name: "Deluxe (Шеринг П3)",
    color: "bg-indigo-600",
    glow: "shadow-[0_0_20px_rgba(79,70,229,0.4)]",
    price1: 1500, // PS4 Price
    price3: 3500, // PS5 Price
    price12: 0,   // N/A
    features: [ "Подписка Deluxe на 12 месяцев", "Игра на вашем личном аккаунте", "Сохранения и достижения на вашем аккаунте", "Экономия до 70% стоимости" ],
    region: "ALL",
    type: "P3_SHARING",
    order: 5
  },
  {
    name: "Deluxe + EA Play (Шеринг П3)",
    color: "bg-purple-600",
    glow: "shadow-[0_0_20px_rgba(147,51,234,0.4)]",
    price1: 2500, // PS4 Price
    price3: 5500, // PS5 Price
    price12: 0,   // N/A
    features: [ "Подписка Deluxe + EA Play на 12 месяцев", "Игра на вашем личном аккаунте", "Сохранения и достижения на вашем аккаунте", "Максимальная выгода" ],
    region: "ALL",
    type: "P3_SHARING",
    order: 6
  }
];

async function main() {
  console.log('1. Updating currency settings (rateTry = 2.5, rateUah = 2.5)...');
  await prisma.settings.upsert({
    where: { id: 'global' },
    update: { rateTry: 2.5, rateUah: 2.5 },
    create: { id: 'global', rateTry: 2.5, rateUah: 2.5 }
  });
  console.log('Currency settings updated successfully.');

  console.log('2. Clearing old subscription plans...');
  await prisma.subscriptionPlan.deleteMany({});
  
  console.log('3. Seeding new subscription plans...');
  for (const plan of plans) {
    await prisma.subscriptionPlan.create({
      data: plan
    });
  }

  console.log('All subscriptions and settings seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
