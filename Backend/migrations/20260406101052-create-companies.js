'use strict';
import validator from 'validator';
/** @type {import('sequelize-cli').Migration} */
 export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner_id: {
        allowNull:false,
        unique: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false,
      },
      website:{
        type:Sequelize.STRING,
        unique: true,
        validate:(value) => {
          if(!validator.isURL(value)){
            throw new Error("Invalid Company Website!")
          }
        }
      },
       logo_url:{
        type:Sequelize.STRING,
        unique: true,
        validate:(value) => {
          if(!validator.isURL(value)){
            throw new Error("Invalid Company Website!")
          }
        }
      },
      description:{
         type: Sequelize.STRING,
        validate:(value) => {
          if(value.length > 500){
            throw new Error("Length of Bio should not exceed above 500 limit")
          }
        }
      },
      location:{ 
        type:Sequelize.STRING,
      },
      size:{
        type:Sequelize.ENUM('1-10', '10-51', '51-100', '100-200', '2001-500', '500+'),

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
    await queryInterface.dropTable('Companies');
  }
};