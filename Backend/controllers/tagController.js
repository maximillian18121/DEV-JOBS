import db from "../models/index.js";

const tags = db.tags;

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const createTags = async (req, res) => {
  
  const currUser = req.currUser;

  if(!currUser){
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "Authenctication required !!",
    });
  }

  const { name } = req.body;

  if (currUser.role != "admin") {
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "Only admin can create tags",
    });
  }

  if (!name) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Please input only valid values in Fields",
    });
  }

  const slug = generateSlug(name);

  try {
    const newTag = await tags.create({
      name,
      slug,
    });
    return res.status(200).json({
      code: `Tag with id ${newTag.id} created successfully`,
      tag: newTag,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

export { createTags };
