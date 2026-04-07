'use strict';

import Model from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Application.init({
    id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
          },
          job_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
          },
          applicant_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
          },
          resume_url: {
            type: DataTypes.STRING,
            validate: (value) => {
              if (!validator.isURL(value)) {
                throw new Error("Invalid Resume URL");
              }
            },
          },
          cover_letter: {
            type: DataTypes.TEXT,
          },
          status: {
            type: DataTypes.ENUM(
              "applied",
              "reviewed",
              "interview",
              "rejected",
              "hired",
            ),
            defaultValue: "applied",
          },
          recruiter_note: {
            type: DataTypes.TEXT,
          },
          createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
          updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
          },
  }, {
    sequelize,
    modelName: 'Application',
  });
  return Application;
};