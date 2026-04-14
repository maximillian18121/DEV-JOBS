"use strict";

import { Model } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */

    async GenerateToken() {

      
      let user = this;

      const newShortToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '15m' },
      );

      const newLargeToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '7d' },
      );

      let parsedTokens = JSON.parse(user.token||"[]");

      parsedTokens.push({
        access_token: newShortToken,
        refresh_token: newLargeToken,
      })

      try{
         await User.update(
        { token: JSON.stringify(parsedTokens) },
        { where: { id: user.id } }
      );
      }
      catch(error){
        console.log(error);
        throw new Error(error);
      }
      // Use update() method instead of save() to avoid validation errors on other fields
     

      // Refresh the user object with updated token
      user.token = JSON.stringify(parsedTokens);
      await user.save();
      return parsedTokens;
    }

    static async findByCredentials(email, password){

      const user = await User.findOne({ where: { email: email.trim() } });

      if(!user){
        throw new Error("Invalid email or password");
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if(!isPasswordMatch){
        throw new Error("Invalid email or password");
      }

      return user;
      
    }

    static associate(models) {
      // define association here
      User.hasMany(models.Companies, { foreignKey: "owner_id" });
      User.hasMany(models.refresh_tokens, { foreignKey: "user_id" });
      User.hasMany(models.notifications, { foreignKey: "user_id" });
      // Many-to-many with Jobs through saved_jobs
      User.belongsToMany(models.Jobs, {
        through: models.saved_jobs,
        foreignKey: "user_id",
        otherKey: "job_id",
        as: "savedJobs",
      });

      User.belongsToMany(models.Companies, {
        through: models.Jobs,
        foreignKey: "posted_by",
        otherKey: "company_id",
        as: "AppliedCompanies",
      });

      User.belongsToMany(models.Jobs, {
        through: models.Application,
        foreignKey: "applicant_id",
        otherKey: "job_id",
        as: "AppliedJobs",
      });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        allowNull: false,
        validate: (value) => {
          if (value.length < 2) {
            throw new Error("Invalid First Name !");
          }
        },
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        unique: true,
        validate: (value) => {
          if (!validator.isEmail(value)) {
            throw new Error("Invalid Email !");
          }
        },
        type: DataTypes.STRING,
      },
      password: {
        allowNull: false,
        unique: true,
        validate: (value) => {
          if (!validator.isStrongPassword(value)) {
            throw new Error(
              "Password must include upper, lower, number & special character (min 8).",
            );
          }
        },
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("candidate", "recruiter", "admin"),
        defaultValue: "candidate",
      },
      avatar_url: {
        type: DataTypes.STRING,
        validate: (value) => {
          if (value && !validator.isURL(value)) {
            throw new Error("Invalid Avatar URL !");
          }
        },
      },
      resume_url: {
        type: DataTypes.STRING,
        validate: (value) => {
          if (value && !validator.isURL(value)) {
            throw new Error("Invalid Resume URL !");
          }
        },
      },
      bio: {
        type: DataTypes.STRING,
        validate: (value) => {
          if (value && value.length > 500) {
            throw new Error("Length of Bio should not exceed above 500 limit");
          }
        },
      },
      token: {
        type: DataTypes.STRING(512),
        defaultValue: "[]",
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
      modelName: "User",
      hooks:{
        beforeCreate:async(user, options)=>{
          
          user.firstName = user.firstName?.trim();
          user.email = user.email?.trim();
          user.password = user.password?.trim();

          user.password = await bcrypt.hash(user.password, 12);

          // user.token = JSON.stringify([]);

        },
        beforeUpdate:async(user,options)=>{
          if(user.changed('password')){
            user.password = user.password?.trim();

            user.password = await bcrypt.hash(user.password, 12);
          }
        },
      },
    },
  );
  return User;
};
