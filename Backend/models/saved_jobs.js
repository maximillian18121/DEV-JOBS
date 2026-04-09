'use strict';

import {Model} from 'sequelize';
export default (sequelize, DataTypes) => {
  class saved_jobs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      saved_jobs.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      saved_jobs.belongsTo(models.Jobs, { foreignKey: 'job_id', as: 'job' });
    }
  }
  saved_jobs.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
          model:"Users",
          key: "id"
        }
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
          model:"Jobs",
          key:"id"
        }
      },
      saved_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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
    modelName: 'saved_jobs',
  });
  return saved_jobs;
};