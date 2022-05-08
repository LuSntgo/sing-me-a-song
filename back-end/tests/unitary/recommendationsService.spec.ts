import _, { max } from "lodash";
import { recommendationRepository } from "../../src/repositories/recommendationRepository.js";
import { recommendationService } from "../../src/services/recommendationsService";
import { faker } from "@faker-js/faker";
import { jest } from "@jest/globals";
import { conflictError, notFoundError } from "../../src/utils/errorUtils";

beforeEach(() => {
  jest.restoreAllMocks();
});

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

      jest.spyOn(recommendationRepository, "findByName").mockResolvedValue({
        id: faker.datatype.number(),
        score: faker.datatype.number(),
        name: body.name,
        youtubeLink: body.youtubeLink,
      });

      const result = recommendationService.insert(body);

      expect(result).rejects.toBeInstanceOf(conflictError);
    });
  });

  describe("upvote", () => {
    it("should get a recommendation by id", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      const spy = jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue({
          id: body.id,
          score: faker.datatype.number(),
          name: faker.name.findName(),
          youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
        });

      jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValue(undefined);

      await recommendationService.upvote(body.id);

      expect(spy).toHaveBeenCalledWith(body.id);
    });

    it("should call increment with correct values", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      jest.spyOn(recommendationRepository, "find").mockResolvedValue({
        id: body.id,
        score: faker.datatype.number(),
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      });

      const spy = jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValue({
          id: body.id,
          score: faker.datatype.number(),
          name: faker.name.findName(),
          youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
        });

      await recommendationService.upvote(body.id);

      expect(spy).toHaveBeenCalledWith(body.id, "increment");
    });
  });

  describe("downvote", () => {
    it("should call repository find with correct params", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      const spy = jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue({
          id: body.id,
          score: faker.datatype.number({ min: -4 }),
          name: faker.name.findName(),
          youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
        });

      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue({
        id: body.id,
        score: faker.datatype.number(),
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      });

      await recommendationService.downvote(body.id);

      expect(spy).toHaveBeenCalledWith(body.id);
    });

    it("should call decrement with correct values", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      jest.spyOn(recommendationRepository, "find").mockResolvedValue({
        id: body.id,
        score: faker.datatype.number(),
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      });

      const spy = jest
        .spyOn(recommendationRepository, "updateScore")
        .mockResolvedValue({
          id: body.id,
          score: faker.datatype.number(),
          name: faker.name.findName(),
          youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
        });

      await recommendationService.downvote(body.id);

      expect(spy).toHaveBeenCalledWith(body.id, "decrement");
    });

    it("should call delete when updated score is lowest then -5", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      jest.spyOn(recommendationRepository, "find").mockResolvedValue({
        id: body.id,
        score: faker.datatype.number(),
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      });

      jest.spyOn(recommendationRepository, "updateScore").mockResolvedValue({
        id: body.id,
        score: -6,
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      });

      const spy = jest
        .spyOn(recommendationRepository, "remove")
        .mockResolvedValue(undefined);

      await recommendationService.downvote(body.id);

      expect(spy).toHaveBeenCalledWith(body.id);
    });
  });

  describe("get", () => {
    it("should call all recommendations with correct params", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([
          {
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          },
        ]);

      await recommendationService.get();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("getTop", () => {
    it("should call get amount by score with correct params", async () => {
      const body = {
        amount: faker.datatype.number(),
      };

      const spy = jest
        .spyOn(recommendationRepository, "getAmountByScore")
        .mockResolvedValue(
          _.times(10, () => ({
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          }))
        );

      await recommendationService.getTop(body.amount);

      expect(spy).toHaveBeenCalledWith(body.amount);
    });
  });

  describe("getById", () => {
    it("should call find with correct values", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      const spy = jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue({
          id: body.id,
          score: faker.datatype.number(),
          name: faker.name.findName(),
          youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
        });

      await recommendationService.getById(body.id);

      expect(spy).toHaveBeenCalledWith(body.id);
    });

    it("should throw when doesn't exists a recommendation", async () => {
      const body = {
        id: faker.datatype.number(),
      };

      const spy = jest
        .spyOn(recommendationRepository, "find")
        .mockResolvedValue(undefined);

      const result = recommendationService.getById(body.id);

      expect(result).rejects.toBeInstanceOf(notFoundError);
    });
  });

  describe("getRandom", () => {
    it("should call findAll with gt into score filter param when math.random return < 0.7", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([
          {
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          },
        ]);

      jest.spyOn(Math, "random").mockReturnValue(0.6);

      await recommendationService.getRandom();

      expect(spy).toHaveBeenCalledWith({ score: 10, scoreFilter: "gt" });
    });
    it("should call findAll with lte into score filter param when math.random return > 0.7", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([
          {
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          },
        ]);

      jest.spyOn(Math, "random").mockReturnValue(0.8);

      await recommendationService.getRandom();

      expect(spy).toHaveBeenCalledWith({ score: 10, scoreFilter: "lte" });
    });

    it("should call findAll with correct params", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([
          {
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          },
        ]);

      jest
        .spyOn(Math, "random")
        .mockReturnValue(faker.datatype.float({ min: 0, max: 1 }));

      await recommendationService.getRandom();

      expect(spy).toHaveBeenCalledWith({
        score: 10,
        scoreFilter: expect.any(String),
      });
    });

    it("should call findAll two times when doesn't exists any recommendation with score > 10", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: faker.datatype.number(),
            score: faker.datatype.number(),
            name: faker.name.findName(),
            youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
          },
        ]);

      jest
        .spyOn(Math, "random")
        .mockReturnValue(faker.datatype.float({ min: 0, max: 1 }));

      await recommendationService.getRandom();

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should throw notFoundError when doesn't exists any recommendation", async () => {
      const spy = jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue([]);

      jest
        .spyOn(Math, "random")
        .mockReturnValue(faker.datatype.float({ min: 0, max: 1 }));

      const result = recommendationService.getRandom();

      expect(result).rejects.toBeInstanceOf(notFoundError);
    });

    it.only("should return a random recommendation", async () => {
      const recommendations = _.times(10, () => ({
        id: faker.datatype.number(),
        score: faker.datatype.number(),
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      }));

      jest
        .spyOn(recommendationRepository, "findAll")
        .mockResolvedValue(recommendations);

      jest
        .spyOn(Math, "random")
        .mockReturnValue(faker.datatype.float({ min: 0, max: 1 }));

      jest.spyOn(Math, "floor").mockReturnValue(5);

      const result = await recommendationService.getRandom();

      expect(result).toEqual(recommendations[5]);
    });
  });
});

// getRandom,
