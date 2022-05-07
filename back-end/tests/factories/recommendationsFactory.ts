import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";
import { prisma } from "../../src/database.js";

export function createRecommendation(params: Partial<Recommendation> ={} ): Promise<Recommendation> {
  return prisma.recommendation.create({
      data: {
        name: params.name || faker.name.findName(),
        youtubeLink: params.youtubeLink ||  `https://www.youtube.com/${faker.datatype.uuid()}`,
        score: params.score || undefined 
      }
  });
}

export function loadRecommendation(id: number): Promise<Recommendation>{
    return prisma.recommendation.findFirst({
        where: {
            id
        }
    })
}

