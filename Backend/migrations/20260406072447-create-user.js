'use strict';
import validator from "validator";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        allowNull:false,
        validate: (value) => {
          if(value.length<2){
            throw new Error("Invalid First Name !")
          }
        },
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      email: {
        allowNull:false,
        unique:true,
        validate: (value) => {
          if(!validator.isEmail(value)){
            throw new Error("Invalid Email !")
          }
        },
        type: Sequelize.STRING,
      },
      password:{
        allowNull:false,
        unique: true,
        validate: (value) => {
          if(!validator.isStrongPassword(value)){
           throw new Error("Password must include upper, lower, number & special character (min 8).");
          }
        },
        type: Sequelize.STRING,
      },
      role:{
        type: Sequelize.ENUM('candidate','recruiter','admin'),
        defaultValue: 'candidate',

      },
      avatar_url: {
        type: Sequelize.STRING,
        validate:(value) => {
          if(!validator.isURL(value)){
            throw new Error("Invalid Avatar URL !")
          }
        }
      },
      resume_url: {
        type: Sequelize.STRING,
        validate:(value) => {
          if(!validator.isURL(value)){
            throw new Error("Invalid Avatar URL !")
          }
        }
      },
      bio:{
        type: Sequelize.STRING,
        validate:(value) => {
          if(value.length > 500){
            throw new Error("Length of Bio should not exceed above 500 limit")
          }
        }
      },
      token:{
        type:Sequelize.TEXT,
        defaultValue:"[]",
        allowNull: false,
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
    await queryInterface.dropTable('Users');
  }
};