import { prisma } from "../src/database.js";

export async function  cleanDatabase() {
    await prisma.recommendation.deleteMany()
}