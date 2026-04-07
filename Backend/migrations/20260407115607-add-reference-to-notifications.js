'use strict';

/** @type {import('sequelize-cli').Migration} */
  export default {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("notifications", "user_id", {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER,
      references: {
        model: "Users", // referenced table
        key: "id",
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     * user_id:{
        type: Sequelize.INTEGER,
        allowNull:false,
        unique: true,
      },
     */
     await queryInterface.changeColumn("notifications", "user_id", {
      allowNull: false,
      unique: true,
      type: Sequelize.INTEGER,
    });
  }
};
