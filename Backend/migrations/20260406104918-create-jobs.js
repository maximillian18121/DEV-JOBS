"use strict";
/** @type {import('sequelize-cli').Migration} */
 export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Jobs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      company_id: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
      },
      posted_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: { type: Sequelize.TEXT, allowNull: false },
      location: { type: Sequelize.STRING },
      job_type: {
        type: Sequelize.ENUM(
          "full-time",
          "part-time",
          "contract",
          "internship",
        ),
      },
      work_mode: { type: Sequelize.ENUM("remote", "onsite", "hybrid") },
      salary_min: { type: Sequelize.INTEGER },
      salary_max: { type: Sequelize.INTEGER },
      status: {
        type: Sequelize.ENUM("active", "closed", "draft"),
        defaultValue: "active",
      },
      expires_at: { type: Sequelize.DATE },
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
    await queryInterface.dropTable("Jobs");
  },
};
