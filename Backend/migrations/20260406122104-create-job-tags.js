'use strict';
/** @type {import('sequelize-cli').Migration} */
export default  {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_tags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
      },
      job_id:{
        type: Sequelize.INTEGER,
        allowNull:false,
        unique:true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('job_tags');
  }
};