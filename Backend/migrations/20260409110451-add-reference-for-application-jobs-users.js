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
    await queryInterface.changeColumn('Applications', "job_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
      references:{
        model:"Jobs",
        key:"id"
      }
    })

    await queryInterface.changeColumn('Applications', "applicant_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
      references:{
        model:"Users",
        key:"id"
      }
    })

    await queryInterface.addIndex('Applications',['job_id','applicant_id'],{
      unique:true,
      name: "unique_user_job_save_applications"
    })

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn('Applications', "job_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
    })

    await queryInterface.changeColumn('Applications', "applicant_id", {
      allowNull: false,
      type: Sequelize.INTEGER,
    })

    await queryInterface.removeIndex('Applications',"unique_user_job_save_applications");
  }
};
