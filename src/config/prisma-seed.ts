import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check and insert post types if they do not exist
  const postTypes = await prisma.postType.findMany();
  if (postTypes.length === 0) {
    const questionType = await prisma.postType.create({
      data: {
        type_name: "Question",
      },
    });

    const answerType = await prisma.postType.create({
      data: {
        type_name: "Answer",
      },
    });

    console.log("Inserted post types:", { questionType, answerType });
  } else {
    console.log("Post types already exist.");
  }

  // Check and insert vote types if they do not exist
  const voteTypes = await prisma.voteType.findMany();
  if (voteTypes.length === 0) {
    const upvote = await prisma.voteType.create({
      data: {
        vote_type: "Upvote",
      },
    });

    const downvote = await prisma.voteType.create({
      data: {
        vote_type: "Downvote",
      },
    });

    console.log("Inserted vote types:", { upvote, downvote });
  } else {
    console.log("Vote types already exist.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
