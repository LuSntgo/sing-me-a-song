/// <reference types="cypress" />
import _ from "lodash";
import { faker } from "@faker-js/faker";

describe("HomePage", () => {
  it("should add a recommendation", () => {
    const recommendation = {
      name: faker.name.findName(),
      youtubeLink: `https://www.youtube.com/${faker.datatype.uuid()}`,
    };

    cy.visit("http://localhost:3000/");
    cy.get("input[type=text]").type(recommendation.name);
    cy.get("input[type=link]").type(recommendation.youtubeLink);
    cy.get(".btn").click();
  });

  it("should add a score when click on the upvote icon", () => {
    cy.get(".GoArrowUp").click({ multiple: true });
  });

  it("should remove a score point when click on the downvote icon", () => {
    cy.get(".GoArrowDown").click({ multiple: true });
  });

  it("should remove a recommendation when the score point is < -5", () => {
    _.times(6, () => {
      cy.get(".GoArrowDown").click({ multiple: true });
    });
  });


});

describe("Random page", () => {
    it.only("should show only one random recommendation", () => {
  
      cy.visit("http://localhost:3000/random");
      cy.get('iframe').should('have.length', 1)
    });

  });

  describe("Top page", () => {
    it("should shows at most 10 recommendations", () => {
  
      cy.visit("http://localhost:3000/top");
      cy.get('iframe').should('be.length.lte', 10)
    });
    
  });

