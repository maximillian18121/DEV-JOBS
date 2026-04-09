'use strict';

import {Model} from 'sequelize';
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Companies, {foreignKey: "owner_id"});
      User.hasMany(models.refresh_tokens, {foreignKey:"user_id"});
      User.hasMany(models.notifications, {foreignKey: "user_id"});
      // Many-to-many with Jobs through saved_jobs
      User.belongsToMany(models.Jobs, {
        through: models.saved_jobs,
        foreignKey: 'user_id',
        otherKey: 'job_id',
        as: 'savedJobs'
      });

      User.belongsToMany(models.Companies,{
        through:models.Jobs,
        foreignKey:"posted_by",
        otherKey:"company_id",
        as:"AppliedCompanies"
      })
    }
  }
  User.init({
    id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
          },
          firstName: {
            allowNull:false,
            validate: (value) => {
              if(value.length<2){
                throw new Error("Invalid First Name !")
              }
            },
            type: DataTypes.STRING
          },
          lastName: {
            type: DataTypes.STRING
          },
          email: {
            allowNull:false,
            unique:true,
            validate: (value) => {
              if(!validator.isEmail(value)){
                throw new Error("Invalid Email !")
              }
            },
            type: DataTypes.STRING,
          },
          password:{
            allowNull:false,
            unique: true,
            validate: (value) => {
              if(!validator.isStrongPassword(value)){
               throw new Error("Password must include upper, lower, number & special character (min 8).");
              }
            },
            type: DataTypes.STRING,
          },
          role:{
            type: DataTypes.ENUM('candidate','recruiter','admin'),
            defaultValue: 'candidate',
    
          },
          avatar_url: {
            type: DataTypes.STRING,
            validate:(value) => {
              if(!validator.isURL(value)){
                throw new Error("Invalid Avatar URL !")
              }
            }
          },
          resume_url: {
            type: DataTypes.STRING,
            validate:(value) => {
              if(!validator.isURL(value)){
                throw new Error("Invalid Avatar URL !")
              }
            }
          },
          bio:{
            type: DataTypes.STRING,
            validate:(value) => {
              if(value.length > 500){
                throw new Error("Length of Bio should not exceed above 500 limit")
              }
            }
          },
          token:{
            type:DataTypes.TEXT,
            defaultValue:"[]",
            allowNull: false,
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
          }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};