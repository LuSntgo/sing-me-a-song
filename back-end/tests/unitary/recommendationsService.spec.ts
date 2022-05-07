import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { conflictError } from "../../src/utils/errorUtils";

describe("Unitary tests", () => {
  describe("insert", () => {
    it("should call create recommendation with correct params", async () => {
      const body = {
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      };
      const spy = jest
        .spyOn(recommendationRepository, "create")
        .mockResolvedValue(undefined);

      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValue(undefined);

      await recommendationService.insert(body);

      expect(spy).toHaveBeenCalledWith({
        name: body.name,
        youtubeLink: body.youtubeLink,
      });
    });

    it("should call findByName with correct params", async () => {
      const body = {
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      };

      jest
        .spyOn(recommendationRepository, "create")
        .mockResolvedValue(undefined);

      const spy = jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValue(undefined);

      await recommendationService.insert(body);

      expect(spy).toHaveBeenCalledWith(body.name);
    });

    it("should throw when have a conflict name", async () => {
      const body = {
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      };
      jest
        .spyOn(recommendationRepository, "create")
        .mockResolvedValue(undefined);

      jest
        .spyOn(recommendationRepository, "findByName")
        .mockResolvedValue({
          id: faker.datatype.number(),
          score: faker.datatype.number(),
          name: body.name,
          youtubeLink: body.youtubeLink,
        });

      const result = recommendationService.insert(body);

      expect(result).rejects.toBeInstanceOf(conflictError);
    });
  });
});
