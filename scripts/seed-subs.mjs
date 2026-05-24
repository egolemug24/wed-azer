import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: "Essential",
    color: "bg-zinc-500",
    glow: "shadow-[0_0_20px_rgba(113,113,122,0.3)]",
    price1: 690,
    price3: 1690,
    price12: 4290,
    features: [ "Ежемесячные игры", "Сетевая игра", "Эксклюзивные скидки", "Облачное хранилище" ]
  },
  {
    name: "Extra",
    color: "bg-yellow-500",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    price1: 990,
    price3: 2490,
    price12: 6490,
    features: [ "Все из Essential", "Каталог игр (400+ игр)", "Ubisoft+ Classics" ],
    popular: true
  },
  {
    name: "Deluxe",
    color: "bg-ps-blue",
    glow: "shadow-[0_0_20px_rgba(37,99,235,0.4)]",
    price1: 1290,
    price3: 3290,
    price12: 7490,
    features: [ "Все из Extra", "Каталог классики", "Пробные версии игр" ]
  }
];

async function main() {
  await prisma.subscriptionPlan.deleteMany({});
  
  for (const plan of plans) {
    await prisma.subscriptionPlan.create({
      data: plan
    });
  }

  console.log('Subscriptions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
