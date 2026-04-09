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
    await queryInterface.changeColumn("saved_jobs", "user_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "Users", // referenced table
        key: "id",
      },
    });

    await queryInterface.changeColumn("saved_jobs", "job_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: {
        model: "Jobs", // referenced table
        key: "id",
      },
    });

    // Add unique constraint on (user_id, job_id) to prevent duplicate saves
    await queryInterface.addIndex("saved_jobs", ["user_id", "job_id"], {
      unique: true,
      name: "unique_user_job_save"
    });


  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn("saved_jobs", "user_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn("saved_jobs", "job_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
    });

    // Remove unique constraint
    await queryInterface.removeIndex("saved_jobs", "unique_user_job_save");


  }
};
