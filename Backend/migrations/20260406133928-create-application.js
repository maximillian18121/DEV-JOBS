"use strict";

import validator from "validator";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Applications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      job_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      applicant_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      resume_url: {
        type: Sequelize.STRING,
        validate: (value) => {
          if (!validator.isURL(value)) {
            throw new Error("Invalid Resume URL");
          }
        },
      },
      cover_letter: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM(
          "applied",
          "reviewed",
          "interview",
          "rejected",
          "hired",
        ),
        defaultValue: "applied",
      },
      recruiter_note: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Applications");
  },
};
