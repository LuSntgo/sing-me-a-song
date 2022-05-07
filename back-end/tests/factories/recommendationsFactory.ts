import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
import { prisma } from "../../src/database.js";

export function createRecommendation(): Promise<Recommendation> {
  return prisma.recommendation.create({
      data: {
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      }
  });
}
