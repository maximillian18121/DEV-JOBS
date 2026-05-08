import db from "../models/index.js";

const company = db.Companies;

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

export { createCompany, updateCompany };
