import redisClient from "../config/redis";

export const deleteKeysByPattern = async (pattern: string): Promise<void> => {
  const stream = redisClient.scanStream({
    match: pattern,
    count: 100, // Adjust the count based on your needs
  });

  stream.on("data", (keys: string[]) => {
    if (keys.length) {
      const pipeline = redisClient.pipeline();
      keys.forEach((key) => {
        pipeline.del(key);
      });
      pipeline.exec();
    }
  });

  return new Promise((resolve, reject) => {
    stream.on("end", resolve);
    stream.on("error", reject);
  });
};
