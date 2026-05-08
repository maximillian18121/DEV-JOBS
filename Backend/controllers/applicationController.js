import db from "../models/index.js";

const application = db.Application;
const job = db.Jobs;
const user = db.User;

const createApplication = async (req, res) => {
  const { id } = req.params;
  const currUser = req.currUser;
  const role = req.role;

  const { cover_letter, recruiter_note } = req.body;

  const resumeFile = req.file;

  const fileURL = null;

  if (resumeFile) {
    fileURL = `/uploads/company-logos/${logoFile.filename}`;
  }

  // if(!resumeFile){
  //     return res.status(400).json({
  //           code: "VALIDATION_ERROR",
  //           message: "Please upload resume document."
  //         });
  // }

  if (!cover_letter || !recruiter_note) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Please input only valid values in Fields",
    });
  }

  const transaction = await db.sequelize.transaction();

  try {
    const newApplication = await application.create(
      {
        job_id: id,
        applicant_id: currUser.id,
        cover_letter,
        recruiter_note,
        status: "applied",
        resume_url: fileURL,
      },
      { transaction },
    );

    console.log("newApplication", newApplication);

    if (!newApplication) {
      return res.status(400).json({
        code: "LOGICAL_ERROR",
        message: "Something went wrong !",
      });
    }

    await transaction.commit();

    return res.status(200).json({
      code: `New Application created with id ${newApplication.id} `,
      result: newApplication,
    });
  } catch (error) {
    await transaction.rollback();
    console.log(error);
    return res.status(400).json({
      code: "LOGICAL_ERROR",
      message: "Something went wrong !",
    });
  }
};

const getApplicationFromJob = async (req, res) => {
  const { id } = req.params;

  const {
    status,
    page,
    limit,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const statusType = ["applied", "reviewed", "interview", "rejected", "hired"];

  const where = {};

  if (id) {
    where.job_id = id;
  }

  if (status && statusType.includes(status)) {
    where.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  // Limit between 1 and 50 for performance and UX
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  // Calculate offset for pagination
  const offset = (pageNum - 1) * limitNum;

  const applicantInclude = [
    {
      model: user,
      as: "applicants",
      attributes: ["id", "firstName", "lastName", "email", "role", "bio"],
    },
  ];

  const sortField = sortBy ? sortBy : "createdAt";

  const sortOrder = sortField === "asc" ? "ASC" : "DESC";

  try {
    const allApplicationFromJob = await application.findAll({
      where,
      include: applicantInclude,
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
    });

    return res.status(200).json({
      data: allApplicationFromJob,
      meta: {
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log(error);

    // Check for specific Sequelize errors
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        code: "DATABASE_UNAVAILABLE",
        message: "Database temporarily unavailable",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      });
    }

    // Generic internal error
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch jobs",
      // Only include error details in development
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getApplicationFromMe = async (req, res) => {
  const currUser = req.currUser;

  const {
    status,
    limit,
    page,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const where = {};

  if (currUser.id) {
    where.applicant_id = currUser.id;
  }

  const statusType = ["applied", "reviewed", "interview", "rejected", "hired"];

  if (status && statusType.includes(status)) {
    where.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  const limitNum = Math.min(1, parseInt(limit, 10) || 10);

  const offset = (pageNum - 1) * limitNum;

  try {
    const allApplicationByMe = await application.findAll({
      where,
      include: [
        {
          model: user,
          as: "applicants",
          attributes: ["id", "firstName", "lastName", "email", "role", "bio"],
        },
      ],
      order: [[sortBy, order]],
      limit,
      offset,
    });

    return res.status(200).json({
      data: allApplicationByMe,
      meta: {
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.log(error);

    // Check for specific Sequelize errors
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        code: "DATABASE_UNAVAILABLE",
        message: "Database temporarily unavailable",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "Invalid query parameters",
      });
    }

    // Generic internal error
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch jobs",
      // Only include error details in development
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateApplicationById = async (req, res) => {
  const { id, status } = req.params;

  const { recruiter_note } = req.body;

  const currUser = req.currUser;

  const statusType = ["applied", "reviewed", "interview", "rejected", "hired"];

  if (!statusType.includes(status) || !recruiter_note) {
    return res.status(400).json({
      code: "BAD_OPTION_FOR_VALUES",
      message: "Invalid Values",
    });
  }

  try {
    const specificApplication = await application.findByPk(id, {
      include: [
        {
          model: job,
          as: "jobs",
        },
      ],
    });

    console.log(
      "specificApplication",
      specificApplication.jobs.dataValues.posted_by,
    );
    if (!(specificApplication.jobs.dataValues.posted_by === currUser.id)) {
      return res.status(404).json({
        code: "ACCESS DENIED",
        message: "INVALID PRIVILEGE",
      });
    }

    specificApplication["status"] = status;
    specificApplication["recruiter_note"] = recruiter_note;

    await specificApplication.save();

    const updatedApplication = await application.findByPk(id, {
      includ: [
        {
          model: job,
          as: "jobs",
        },
      ],
    });

    return res.status(200).json({
      data: updatedApplication,
      message: `Job with id ${id} updated successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getApplicationById = async (req, res) => {
  const { id } = req.params;

  try {
    const specificApplication = await application.findByPk(id, {
      include: [
        {
          model: job,
          as: "jobs",
        },
        {
          model: user,
          as: "applicants",
        },
      ],
    });

    if (!specificApplication) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found",
      });
    }

    return res.status(200).json({
      data: specificApplication,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch job details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export {
  createApplication,
  getApplicationFromJob,
  getApplicationFromMe,
  updateApplicationById,
  getApplicationById
};
