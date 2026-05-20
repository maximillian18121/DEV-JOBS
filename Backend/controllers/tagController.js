import db from "../models/index.js";
import { literal, Op } from "sequelize";

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

const getAllTags = async (req, res) => {
  const {search} = req.query;

  try {

    const where = {};

    if(search && typeof search === "string" && search.trim()){
      const searchTerm = search.trim();
      where[Op.or] = [
        {name : { [Op.iLike]: `%${searchTerm}%`}},
        {slug : { [Op.iLike]: `%${searchTerm}%`}}
      ]
    }
   
    const allTags = await tags.findAll(
      {
        where,
        attributes:[
          "id","name","slug",
           [
          literal(`(
            SELECT COUNT(*)
            FROM "job_tags"
            INNER JOIN "Jobs" ON "job_tags"."job_id" = "Jobs"."id"
            WHERE "job_tags"."tag_id" = "tags"."id"
              AND "Jobs"."status" = 'active'
          )`),
          "job_count",
        ],
        ]
      }
    );
    return res.status(200).json({
      data:allTags
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
}


export { createTags, getAllTags };
