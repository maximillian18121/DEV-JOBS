'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id:{
        type: Sequelize.INTEGER,
        allowNull:false,
        unique: true,
      },
      type:{
        type: Sequelize.ENUM('application_update', 'new_applicant', 'job_expiring', 'system'),
        allowNull:false,
        defaultValue: 'application_update'
      },
      message: {
        type: Sequelize.STRING,
        allowNull:false
      },
      is_read:{
        type: Sequelize.BOOLEAN,
        defaultValue:false
      },
      reference_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
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
    await queryInterface.dropTable('notifications');
  }
};