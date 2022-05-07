import { faker } from "@faker-js/faker";
import _ from "lodash";
import supertest from "supertest";
import app from "../../src/app.js";
import {
  createRecommendation,
  loadRecommendation,
} from "../factories/recommendationsFactory.js";
import { cleanDatabase } from "../helpers.js";

beforeEach(async () => {
  await cleanDatabase();
});

describe("Integration Tests", () => {
  describe("POST /recommendation", () => {
    it("should return success", async () => {
      const body = {
        name: faker.name.findName(),
        youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
      };

      const response = await supertest(app).post("/recommendations").send(body);

      expect(response.status).toBe(201);
    });
  });

  describe("POST /recommendation/:id/upvote", () => {
    it("should return success when exist a recommendation", async () => {
      const data = await createRecommendation();

      const response = await supertest(app)
        .post(`/recommendations/${data.id}/upvote`)
        .send();

      expect(response.status).toBe(200);
    });

    it("should return 404 when doesn't exists", async () => {
      const id = faker.datatype.number({ max: 0 });

      const response = await supertest(app)
        .post(`/recommendations/${id}/upvote`)
        .send();

      expect(response.status).toBe(404);
    });

    it("should return +1 when is possible", async () => {
      const data = await createRecommendation();

      await supertest(app).post(`/recommendations/${data.id}/upvote`).send();

      const result = await loadRecommendation(data.id);
      expect(result.score - data.score).toEqual(1);
    });
  });

  describe("POST /recommendation/:id/downvote", () => {
    it("should return success when exist a recommendation", async () => {
      const data = await createRecommendation();

      const response = await supertest(app)
        .post(`/recommendations/${data.id}/downvote`)
        .send();

      expect(response.status).toBe(200);
    });

    it("should return 404 when doesn't exists", async () => {
      const id = faker.datatype.number({ max: 0 });

      const response = await supertest(app)
        .post(`/recommendations/${id}/downvote`)
        .send();

      expect(response.status).toBe(404);
    });

    it("should return remove 1 upvote", async () => {
      const data = await createRecommendation();

      await supertest(app).post(`/recommendations/${data.id}/downvote`).send();

      const result = await loadRecommendation(data.id);
      expect(result.score - data.score).toEqual(-1);
    });

    it("should delete the recommendation when score is lowest then -5", async () => {
      const data = await createRecommendation({
        score: -5,
      });

      await supertest(app).post(`/recommendations/${data.id}/downvote`).send();

      const result = await loadRecommendation(data.id);
      expect(result).toBeNull();
    });
  });

  describe("GET /recommendation", () => {
    it("should return 10 recommendations", async () => {
      await Promise.all(
        _.times(15, async () => {
          await createRecommendation();
        })
      );

      const response = await supertest(app).get("/recommendations");

      expect(response.body.length).toBe(10);
    });

    it("should return the last 10 recommendations", async () => {
      const data = await Promise.all(
        _.times(15, async () => {
          return await createRecommendation();
        })
      );

      const arrayData = _.take(_.orderBy(data, ["id"], ["desc"]), 10);

      const response = await supertest(app).get("/recommendations");

      expect(response.body).toEqual(arrayData);
    });
  });

  describe("GET /recommendation/:id", () => {
    it("should return success when exist a recommendation by id", async () => {
      const data = await createRecommendation();

      const response = await supertest(app).get(`/recommendations/${data.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(data);
    });

    it("should return empty body when recommendation doesn't exists", async () => {
      const id = faker.datatype.number({ max: 0 });

      const response = await supertest(app).get(`/recommendations/${id}`);

      expect(response.body).toEqual({});
    });
  });
});
