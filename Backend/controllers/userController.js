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
    const newUser = await user.create(
      {
        firstName,
        lastName,
        email,
        password,
        role,
      },
      { transaction: t },
    );

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

    const tokenGenerated = await refresh_tokens.create(
      {
        user_id: newUser.id,
        token: JSON.stringify({
          access_token: token[0].access_token, // Get the first (and newest) token
          refresh_token: token[0].refresh_token,
        }),
        expires_at: new Date(
          newUser.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
      { transaction: t },
    );

    await t.commit();

    console.log(tokenGenerated, "token generated successfully !!");

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

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Validation failed : Invalid email or password !!",
    });
  }

 
  try {

 const existingUser = await user.findByCredentials(email, password);

  if(!existingUser){
     return res.status(409).json({
      code: "CONFLICT",
      message: "Email not registered !!",
    });
  }
    
    const token = await existingUser.GenerateToken();
    const lastToken = token [token.length-1];
    console.log(existingUser, "current user");
    const currUserResponse = {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        full_name: `${existingUser.firstName} ${existingUser.lastName}`.trim(),
        role: existingUser.role,
      },
      tokens: {
        access_token: lastToken.access_token, // Get the first (and newest) token
        refresh_token: lastToken.refresh_token,
        // createdAt : token[0]?.createdAt// For now, same as access token
      },
    };

    const tokenGenerated = await refresh_tokens.create(
      {
        user_id: existingUser.id,
        token: JSON.stringify({
          access_token: lastToken.access_token, // Get the first (and newest) token
          refresh_token: lastToken.refresh_token,
        }),
        expires_at: new Date(
          existingUser.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    );

    return res.status(200).json({
      message: `User with id ${existingUser.id} logged in successfully`,
      user: currUserResponse,
    });
  } catch (error) {
    console.log("Error",error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const refreshToken = async (req,res) => {
    const {refresh_token} = req.body;

    if(!refresh_token){
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "refresh_token is required" });
    }

    const existing_token = await refresh_tokens.findOne({
        where:{
           token: JSON.stringify(refresh_token)
        }
    });

    if(!existing_token){
        return res.status(401).json({ code: "REFRESH_TOKEN_EXPIRED", message: "Refresh token is invalid or expired" });
    }

    if(existing_token.is_revoked){
        return res.status(401).json({ code: "REFRESH_TOKEN_REVOKED", message: "Refresh token is invalid or revoked" });
    }

    if(new Date()> existing_token.expires_at){
        return res.status(401).json({ code: "REFRESH_TOKEN_EXPIRED", message: "Refresh token has expired" });
    }

    const transaction = await db.sequelize.transaction();

    try {
    const updatedRefreshToken = await existing_token.update({is_revoked: true},{transaction});

    const userId = existing_token.user_id;

    const token_user = await user.findByPk(userId,{transaction});

    const newToken = await token_user.GenerateToken();

    const lastToken = newToken [newToken.length -1 ];

     const tokenGenerated = await refresh_tokens.create(
      {
        user_id: userId,
        token: JSON.stringify({
          access_token: lastToken.access_token, // Get the first (and newest) token
          refresh_token: lastToken.refresh_token,
        }),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },{transaction}
    );

    await transaction.commit();

    const new_tokens = {
        access_token: lastToken.access_token,
        refresh_token : lastToken.refresh_token
    }

    return res.status(200).json({
        message:"New token generated successfully",
        token : new_tokens
    })

    } catch (error) {
        await transaction.rollback();
        return res.status(500).json({
            code: "INTERNAL_ERROR",
            message: error.message
        })
    }
}

const logout = async (req,res) => {
    const {refresh_token} = req.body;

    if(!refresh_token){
        return res.status(400).json({ code: "VALIDATION_ERROR", message: "refresh_token is required" });
    }

    

}

export { demoController, register, login, refreshToken };
