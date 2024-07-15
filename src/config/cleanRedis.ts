import { deleteKeysByPattern } from "../utils/redisUtils";
import redisClient from "./redis";

const cleanRedis = async () => {
  await deleteKeysByPattern("user-questions:*");
  console.log("done");
};

const main = async () => {
  console.log(await cleanRedis());
};
main();
