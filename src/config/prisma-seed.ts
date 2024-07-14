import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Insert post types
  const questionType = await prisma.postType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      type_name: "Question",
    },
  });

  const answerType = await prisma.postType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      type_name: "Answer",
    },
  });

  console.log({ questionType, answerType });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
