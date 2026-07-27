// Creates one Prisma client for the application. Every file will import this instead of creating a new PrismaClient. 

import { PrismaClient } from "../generated/prisma/index.js";

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});