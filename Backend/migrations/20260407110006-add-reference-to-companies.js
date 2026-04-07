"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     * Example:
     **/
    await queryInterface.changeColumn("Companies", "owner_id", {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER,
      references: {
        model: "Users", // referenced table
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn("Companies", "owner_id", {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER,
    });
  },
};
