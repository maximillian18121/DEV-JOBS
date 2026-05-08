import { Op } from "sequelize";
import db from "../models/index.js";
import jwt from "jsonwebtoken";

const user = db.User;

const auth = async (req, res, next) => {
  try {
    const bearerToken = await req
      .header("Authorization")
      ?.replace("Bearer ", "");

    console.log(" ************** Token **************", bearerToken);

    if (!bearerToken) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Please authenticate first !!",
      });
    }

    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Please authenticate first !!",
      });
    }

    const currUser = await user.findOne({
      where: {
        email: decoded.email,
      },
    });

    if (!currUser) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Please authenticate first !!",
      });
    }

    // Parse the token array and check if the bearerToken is a valid access_token
    const parsedTokens = JSON.parse(currUser.token || "[]");
    const isValidToken = parsedTokens.some(
      (tokenObj) => tokenObj.refresh_token == bearerToken,
    );

    if (!isValidToken) {
      return res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Invalid or expired token !!",
      });
    }

    req.currUser = currUser;
    req.token = bearerToken;
    req.role = decoded.role;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const checkOwnerShip = async (Model, idParam = "id", ownerKey = "owner_id") => {
  return async (req, res, next) => {
    try {
      const record = await Model.findByPk(req.params[idParam]);

      if (!record) {
        return res.status(404).json({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
      }

      if (req.role == "admin" || record[ownerKey] == req.currUser.id) {
        req.response = record;
        return next();
      }
      return res.status(403).json({
      code: "ACCESS_DENIED",
      message: "You do not own this resource",
    });
    } catch (error) {
      console.log(error);
      return res.status(404).json({
          code: "NOT_FOUND",
          message: "Resource not found",
        });
    }
  };
};

export { auth, checkOwnerShip };
