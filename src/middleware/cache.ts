import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";

export const cache = (keyGenerator: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);

    redisClient.get(key, (err, data) => {
      if (err) {
        next(err);
        return;
      }

      if (data != null) {
        res.send(JSON.parse(data));
      } else {
        const originalSend = res.send.bind(res);

        res.send = (body: any) => {
          redisClient.set(key, JSON.stringify(body), "EX", 3600);
          return originalSend(body);
        };

        next();
      }
    });
  };
};
