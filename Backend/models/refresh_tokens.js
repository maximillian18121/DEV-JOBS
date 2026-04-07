'use strict';

import Model from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class refresh_tokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  refresh_tokens.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull:false
      },
      token:{
        type: DataTypes.STRING(512),
        allowNull:false,
        unique:true
      },
      is_revoked:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
      },
      expires_at:{
        type: DataTypes.DATE, 
        allowNull: false
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
    modelName: 'refresh_tokens',
  });
  return refresh_tokens;
};