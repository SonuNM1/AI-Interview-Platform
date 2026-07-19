// Creates one Prisma client for the application. Every file will import this instead of creating a new PrismaClient. 

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});