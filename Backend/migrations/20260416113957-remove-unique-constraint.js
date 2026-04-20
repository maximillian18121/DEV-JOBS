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
    await queryInterface.changeColumn('job_tags', "job_id", {
      type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:"tags",
          key:"id"
        }
    });

    await queryInterface.changeColumn('job_tags', "tag_id", {
      type: Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:"Jobs",
          key:"id"
        }

    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('job_tags', "job_id", {
      type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:"tags",
          key:"id"
        }
    });

    await queryInterface.changeColumn('job_tags', "tag_id", {
      type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
        references:{
          model:"Jobs",
          key:"id"
        }

    })
  }
};
