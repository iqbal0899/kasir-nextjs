require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const user = await prisma.user.upsert({
    where: {
      username: "admin",
    },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("User berhasil dibuat:");
  console.log({
    id: user.id,
    username: user.username,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });