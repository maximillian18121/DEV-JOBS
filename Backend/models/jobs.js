'use strict';

import Model from 'sequelize';
export default (sequelize, DataTypes) => {
  class Jobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Many-to-many with User through saved_jobs
      Jobs.belongsToMany(models.User, {
        through: models.saved_jobs,
        foreignKey: 'job_id',
        otherKey: 'user_id',
        as: 'savedByUsers'
      });
    }
  }
  Jobs.init({
     id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      company_id: {
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
      },
      posted_by: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: { type: DataTypes.TEXT, allowNull: false },
      location: { type: DataTypes.STRING },
      job_type: {
        type: DataTypes.ENUM(
          "full-time",
          "part-time",
          "contract",
          "internship",
        ),
      },
      work_mode: { type: DataTypes.ENUM("remote", "onsite", "hybrid") },
      salary_min: { type: DataTypes.INTEGER },
      salary_max: { type: DataTypes.INTEGER },
      status: {
        type: DataTypes.ENUM("active", "closed", "draft"),
        defaultValue: "active",
      },
      expires_at: { type: DataTypes.DATE },
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
    modelName: 'Jobs',
  });
  return Jobs;
};