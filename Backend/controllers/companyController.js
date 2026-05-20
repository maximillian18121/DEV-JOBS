import { literal } from "sequelize";
import db from "../models/index.js";

const company = db.Companies;
const job = db.Jobs;
const user = db.User;
const application = db.Application;

const createCompany = async (req, res) => {
  const currUser = req.currUser;
  const { name, website, description, location, size } = req.body;
  const logoFile = req.file;

  if (currUser.role != "recruiter") {
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "Only recruiters can create a company profile",
    });
  }

  const existing_company = await company.findOne({
    where: {
      owner_id: currUser.id,
    },
  });

  if (existing_company) {
    return res.status(409).json({
      code: "COMPANY_EXISTS",
      message: "Recruiter already has a company profile",
    });
  }

  if (!name || !website || !description || !location || !size) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Please input only valid values in Fields",
    });
  }

  try {
    let logoUrl = null;

    if (logoFile) {
      logoUrl = `/uploads/company-logos/${logoFile.filename}`;
    }

    const NewCompany = await company.create({
      owner_id: currUser.id,
      name: name.trim(),
      website: website ? website.trim() : null,
      description: description ? description.trim() : null,
      location: location ? location.trim() : null,
      size: size || null,
      logo_url: logoUrl,
    });

    return res.status(200).json({
      code: `Company with id ${NewCompany.id} created successfully`,
      comapny: NewCompany,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "An error occurred during registration",
    });
  }
};

const updateCompany = async (req, res) => {
  const { id } = req.params;
  const payload = {};
  const allowedParams = ["name", "website", "description", "location", "size"];

  const role = req.currUser.role;

  allowedParams.forEach((params) => {
    if (req.body[params] !== undefined) {
      payload[params] = req.body[params];
    }
  });

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "At least one field must be provided to update",
    });
  }

  const validSizes = ["1-10", "10-51", "51-100", "100-200", "2001-500", "500+"];

  if (payload.size && !validSizes.includes(payload.size)) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid size option",
    });
  }

  try {
    const companyRecord = await company.findByPk(id);

    if (!companyRecord) {
      return res.status(404).json({
        code: "COMPANY_NOT_FOUND",
        message: "Company not found",
      });
    }

    if (!(role == "admin") || companyRecord[owner_id] == req.currUser.id) {
      return res.status(403).json({
        code: "ACCESS_DENIED",
        message: "You do not have permission to update this company",
      });
    }

    const [updatedCount, updatedRows] = await company.update(payload, {
      where: { id },
      returning: true,
    });

    if (updatedCount === 0 || !updatedRows || updatedRows.length === 0) {
      return res.status(400).json({
        code: "UPDATE_FAILED",
        message: "Company update failed",
      });
    }

    return res.status(200).json({
      company: updatedRows[0],
    });
  } catch (error) {
    console.error("updateCompany error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const getCompanyProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const companyRecord = await company.findByPk(id, {
      attributes: [
        "id",
        "owner_id",
        "name",
        "website",
        "logo_url",
        "description",
        "location",
        "size",
        "createdAt",
        "updatedAt",
        [
          literal(`(
            SELECT COUNT(*)
            FROM "Jobs" AS "active_jobs"
            WHERE "active_jobs"."company_id" = "Companies"."id"
              AND "active_jobs"."status" = 'active'
          )`),
          "total_active",
        ],
        [
          literal(`(
            SELECT COUNT(*)
            FROM "Applications" AS "hired_applications"
            INNER JOIN "Jobs" AS "company_jobs"
              ON "hired_applications"."job_id" = "company_jobs"."id"
            WHERE "company_jobs"."company_id" = "Companies"."id"
              AND "hired_applications"."status" = 'hired'
          )`),
          "total_hires",
        ],
      ],
      include: [
        {
          model: user,
          as: "Owner",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: job,
          as: "companies",
          attributes: [
            "id",
            "title",
            "job_type",
            "work_mode",
            "location",
            "salary_min",
            "salary_max",
            "status",
            "createdAt",
          ],
          where: { status: "active" },
          required: false,
          order: [["createdAt", "DESC"]],
          limit: 10,
        },
      ],
    });

    if (!companyRecord) {
      return res.status(404).json({
        code: "COMPANY_NOT_FOUND",
        message: "Company not found",
      });
    }

    const companyData = companyRecord.toJSON();

    const owner = companyData.Owner
      ? {
          id: companyData.Owner.id,
          full_name: `${companyData.Owner.firstName || ""} ${
            companyData.Owner.lastName || ""
          }`.trim(),
        }
      : null;

    const jobs = Array.isArray(companyData.companies)
      ? companyData.companies
      : [];

    const responseCompany = {
      id: companyData.id,
      owner,
      name: companyData.name,
      website: companyData.website,
      logo_url: companyData.logo_url,
      description: companyData.description,
      location: companyData.location,
      size: companyData.size,
      createdAt: companyData.createdAt,
      updatedAt: companyData.updatedAt,
    };

    return res.status(200).json({
      company: responseCompany,
      jobs,
      jobs_meta: {
        total_active: parseInt(companyData.total_active, 10) || 0,
      },
      stats: {
        total_hires: parseInt(companyData.total_hires, 10) || 0,
      },
    });
  } catch (error) {
    console.error("getCompanyProfile error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch company profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateCompanyLogo = async (req, res) => {
  const { id } = req.params;
  const logoFile = req.file;

  if (!logoFile) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "No file uploaded",
    });
  }

  try {
    const companyRecord = await company.findByPk(id);

    if (!companyRecord) {
      return res.status(404).json({
        code: "COMPANY_NOT_FOUND",
        message: "Company not found",
      });
    }

    const logoUrl = `/uploads/company-logos/${logoFile.filename}`;
    companyRecord.logo_url = logoUrl;
    await companyRecord.save();

    return res.status(200).json({
      logo_url: logoUrl,
      company: { logo_url: companyRecord.logo_url },
    });
  } catch (error) {
    console.error("updateCompanyLogo error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to update company logo",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};



export { createCompany, updateCompany, getCompanyProfile, updateCompanyLogo };
