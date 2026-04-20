import db from "../models/index.js";
import jobs from "../models/jobs.js";

const user = db.User;
const job = db.Jobs;
const company = db.Companies;
const job_tags = db.job_tags;
const tags = db.tags;


const createJobs = async (req, res) => {
  const {
    title,
    description,
    job_type,
    work_mode,
    location,
    salary_min,
    salary_max,
    expires_at,
    tag_ids,
  } = req.body;
  const logoFile = req.file;

  if (
    !title ||
    !description ||
    !job_type ||
    !work_mode ||
    !location ||
    !salary_min ||
    !salary_max ||
    !expires_at ||
    !tag_ids
  ) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Please input only valid values in Fields",
    });
  }

  const currUser = req.currUser;

  if (!currUser) {
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "Authenctication required !!",
    });
  }
 

  if (!(currUser.role === 'admin' ||  currUser.role === 'recruiter')) {
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "Only Admins and Recruiters can create tags",
    });
  }

  try {
    var transaction = await db.sequelize.transaction();
    const existing_company = await company.findOne(
      {
        where: {
          owner_id: currUser.id,
        },
      },
      { transaction },
    );

    if (!existing_company) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Recruiter must be associated with a company !!",
      });
    }

    // ⏳ 4. Expiry logic (default 30 days)
    let finalExpiry = expires_at
      ? new Date(expires_at)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newJob = await job.create(
      {
        title: title.trim(),
        description: description.trim(),
        job_type,
        work_mode,
        location: location ? location.trim() : null,
        salary_min: salary_min || null,
        salary_max: salary_max || null,
        expires_at: finalExpiry,
        posted_by: currUser.id,
        company_id: existing_company.id,
      },
      { transaction },
    );

    for (let id of tag_ids) {
    
      const new_job_tags = await job_tags.create(
        {
          job_id:newJob.id,
          tag_id: id,
        },
        { transaction },
      );
    
  }

    const fullJob = await job.findByPk(newJob.id, {
      include: [
        { model: company, as : "companies" },
        { model: tags, as: "RelatedTags" },
      ],
      transaction: transaction
    });

     await transaction.commit();

    return res.status(200).json({
      code:`Job with id ${newJob.id} created successfully !!`,
      job: fullJob,
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

export { createJobs };
