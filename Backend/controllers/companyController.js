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

  if(logoFile){
    logoUrl = `/uploads/company-logos/${logoFile.filename}`;
  }

  const NewCompany = await company.create({
    owner_id : currUser.id,
    name: name.trim(),
    website : website ? website.trim() : null,
    description: description ? description.trim() : null,
    location : location ? location.trim() : null,
    size : size || null,
    logo_url : logoUrl
  })

  return res.status(200).json({
    code: `Company with id ${NewCompany.id} created successfully`,
    comapny :  NewCompany
  })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "An error occurred during registration",
    });
  }
  
};

export { createCompany };
