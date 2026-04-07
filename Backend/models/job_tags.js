'use strict';

import Model from 'sequelize';
export default (sequelize, DataTypes) => {
  class job_tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  job_tags.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        unique:true,
      },
      job_id:{
        type: DataTypes.INTEGER,
        allowNull:false,
        unique:true,
      },
  }, {
    sequelize,
    modelName: 'job_tags',
  });
  return job_tags;
};