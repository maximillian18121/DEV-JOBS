import { Transaction } from "sequelize";
import db from "../models/index.js";

const user = db.User;
const refresh_tokens = db.refresh_tokens;

const demoController = async (req, res) => {
  return res.status(200).json({ message: "Hello from the first api" });
};

const register = async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed : Invalid email or password !!",
    });
  }

  const existingUser = await user.findOne({
    where: {
      email: email.trim(),
    },
  });

  if (existingUser) {
    return res.status(409).json({
      code: "CONFLICT",
      message: "Email already in use !!",
    });
  }

  const t = await db.sequelize.transaction();

  try {
    const newUser = await user.create({
      firstName,
      lastName,
      email,
      password,
      role,
    },{transaction: t});

    const token = await newUser.GenerateToken();

    const newUserResponse = {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        role: newUser.role,
      },
      tokens: {
        access_token: token[0].access_token, // Get the first (and newest) token
        refresh_token: token[0].refresh_token,
        // createdAt : token[0]?.createdAt// For now, same as access token
      },
    };

    const tokenGenerated = await refresh_tokens.create({
      user_id: newUser.id,
      token: JSON.stringify({
        access_token: token[0].access_token, // Get the first (and newest) token
        refresh_token: token[0].refresh_token,
      }),
      expires_at: new Date(newUser.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    },{transaction: t});

    await t.commit();

    console.log(tokenGenerated,"token generated successfully !!");

    

    return res.status(200).json({
      message: `User with id ${newUser.id} create successfully`,
      user: newUserResponse,
    });
  } catch (error) {
    await t.rollback();
    console.error("Register error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "An error occurred during registration",
    });
  }
};

export { demoController, register };
