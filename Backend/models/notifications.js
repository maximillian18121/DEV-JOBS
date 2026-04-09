"use strict";

import Model from "sequelize";
export default (sequelize, DataTypes) => {
  class notifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      notifications.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  notifications.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        unique: true,
        type: DataTypes.INTEGER,
        references: {
          model: "Users", // referenced table
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM(
          "application_update",
          "new_applicant",
          "job_expiring",
          "system",
        ),
        allowNull: false,
        defaultValue: "application_update",
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      reference_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "notifications",
    },
  );
  return notifications;
};
