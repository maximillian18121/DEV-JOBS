'use strict';

import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class tags extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tags.belongsToMany(models.Jobs,{
        through:"job_tags",
        foreignKey:"tag_id",
        otherKey:"job_id",
        as: "AllJobs"
      })
    }
  }
  tags.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      name: {
        type: DataTypes.STRING,
        allowNull:false,
        unique:true,
      },
      slug:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
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
    modelName: 'tags',
  });
  return tags;
};