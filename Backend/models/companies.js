"use strict";
import Model from "sequelize";
export default (sequelize, DataTypes) => {
  class Companies extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Companies.init(
    {
            id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: DataTypes.INTEGER
            },
            owner_id: {
              allowNull:false,
              unique: true,
              type: DataTypes.INTEGER
            },
            name: {
              type: DataTypes.STRING,
              allowNull:false,
            },
            website:{
              type:DataTypes.STRING,
              unique: true,
              validate:(value) => {
                if(!validator.isURL(value)){
                  throw new Error("Invalid Company Website!")
                }
              }
            },
             logo_url:{
              type:DataTypes.STRING,
              unique: true,
              validate:(value) => {
                if(!validator.isURL(value)){
                  throw new Error("Invalid Company Website!")
                }
              }
            },
            description:{
               type: DataTypes.STRING,
              validate:(value) => {
                if(value.length > 500){
                  throw new Error("Length of Bio should not exceed above 500 limit")
                }
              }
            },
            location:{ 
              type:DataTypes.STRING,
            },
            size:{
              type:DataTypes.ENUM('1-10', '10-51', '51-100', '100-200', '2001-500', '500+'),
      
            },
            createdAt: {
              allowNull: false,
              type: DataTypes.DATE
            },
            updatedAt: {
              allowNull: false,
              type: DataTypes.DATE
            }
    },
    {
      sequelize,
      modelName: "Companies",
    },
  );
  return Companies;
};
