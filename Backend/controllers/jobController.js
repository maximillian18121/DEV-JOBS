import { Op, fn, col } from "sequelize";
import db from "../models/index.js";

const user = db.User;
const job = db.Jobs;
const company = db.Companies;
const job_tags = db.job_tags;
const tags = db.tags;
const application = db.Application;
const saved_jobs = db.saved_jobs;

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

  if (!(currUser.role === "admin" || currUser.role === "recruiter")) {
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
          job_id: newJob.id,
          tag_id: id,
        },
        { transaction },
      );
    }

    const fullJob = await job.findByPk(newJob.id, {
      include: [
        { model: company, as: "companies" },
        { model: tags, as: "RelatedTags" },
      ],
      transaction: transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      code: `Job with id ${newJob.id} created successfully !!`,
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

const getAllJobs = async (req, res) => {
  /**
   * Production-Level Job Retrieval Controller
   *
   * This function handles fetching jobs with advanced filtering, pagination, sorting,
   * and role-based data inclusion. It's designed for high-performance and security.
   *
   * Features:
   * - Comprehensive query parameter validation and sanitization
   * - Multiple filter types: search, location, job type, work mode, salary range, tags, company
   * - Efficient pagination with metadata
   * - Sorting with validation
   * - Many-to-many tag filtering using INNER JOIN
   * - Role-based data: candidates get saved job status
   * - Proper error handling and logging
   * - SQL injection prevention via Sequelize ORM
   * - Performance optimizations (subQuery: false, distinct counting)
   *
   * Query Parameters:
   * - page: Page number (default: 1, min: 1)
   * - limit: Items per page (default: 10, max: 50, min: 1)
   * - search: Search in title/description (case-insensitive)
   * - location: Location filter (case-insensitive)
   * - job_type: One of ['full-time', 'part-time', 'contract', 'internship']
   * - work_mode: One of ['remote', 'onsite', 'hybrid']
   * - salary_min: Minimum salary filter (gte)
   * - salary_max: Maximum salary filter (lte)
   * - tags: Comma-separated tag slugs for filtering
   * - sort_by: Sort field (default: 'createdAt', options: ['createdAt', 'salary_min', 'salary_max'])
   * - order: Sort order ('asc' or 'desc', default: 'desc')
   * - company_id: Filter by specific company ID
   *
   * Response Structure:
   * {
   *   data: [Job objects with related data],
   *   meta: {
   *     total: Total job count,
   *     page: Current page,
   *     pages: Total pages,
   *     limit: Items per page
   *   }
   * }
   *
   * For candidates, each job includes 'is_saved' boolean indicating if saved.
   */
  try {
    // Step 1: Extract and validate query parameters with defaults
    const {
      page = 1,
      limit = 10,
      search,
      location,
      job_type,
      work_mode,
      salary_min,
      salary_max,
      tagSlugs,
      sort_by = "createdAt",
      order = "desc",
      company_id,
    } = req.query;

    // Step 2: Validate and sanitize pagination parameters
    // Ensure page is a positive integer, default to 1
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    // Limit between 1 and 50 for performance and UX
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    // Calculate offset for pagination
    const offset = (pageNum - 1) * limitNum;

    // Step 3: Build the WHERE clause for filtering
    // Initialize empty where object for dynamic conditions
    const where = {};

    // Search filter: Match against title or description (case-insensitive)
    // Uses PostgreSQL's ILIKE for case-insensitive search
    if (search && typeof search === "string" && search.trim()) {
      const searchTerm = search.trim();
      // Prevent overly long search terms to avoid performance issues
      if (searchTerm.length > 100) {
        return res.status(400).json({
          code: "VALIDATION_ERROR",
          message: "Search term too long (max 100 characters)",
        });
      }
      where[Op.or] = [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
      ];
    }

    // Location filter: Case-insensitive partial match
    if (location && typeof location === "string" && location.trim()) {
      where.location = { [Op.iLike]: `%${location.trim()}%` };
    }

    // Job type filter: Only allow predefined valid values
    const validJobTypes = ["full-time", "part-time", "contract", "internship"];
    if (job_type && validJobTypes.includes(job_type)) {
      where.job_type = job_type;
    }

    // Work mode filter: Only allow predefined valid values
    const validWorkModes = ["remote", "onsite", "hybrid"];
    if (work_mode && validWorkModes.includes(work_mode)) {
      where.work_mode = work_mode;
    }

    // Salary range filters: Parse as integers, ignore invalid values
    if (salary_min && !isNaN(parseInt(salary_min, 10))) {
      where.salary_min = { [Op.gte]: parseInt(salary_min, 10) };
    }
    if (salary_max && !isNaN(parseInt(salary_max, 10))) {
      where.salary_max = { [Op.lte]: parseInt(salary_max, 10) };
    }

    // Company ID filter: Validate as positive integer if provided
    if (
      company_id &&
      !isNaN(parseInt(company_id, 10)) &&
      parseInt(company_id, 10) > 0
    ) {
      where.company_id = parseInt(company_id, 10);
    }

    // Step 4: Handle tag filtering (many-to-many relationship)
    // Tags are filtered by slug, using INNER JOIN to only include jobs with matching tags
    let tagInclude = null;
    if (tagSlugs && typeof tagSlugs === "string" && tagSlugs.trim()) {
      const tagSlugsList = tags
        .split(",")
        .map((slug) => slug.trim())
        .filter((slug) => slug.length > 0 && slug.length <= 50); // Sanitize slugs

      if (tagSlugsList.length > 0) {
        // Limit to prevent excessive filtering
        if (tagSlugsList.length > 10) {
          return res.status(400).json({
            code: "VALIDATION_ERROR",
            message: "Too many tags (max 10)",
          });
        }

        tagInclude = {
          model: tags,
          as: "RelatedTags",
          attributes: ["id", "name", "slug"],
          where: { slug: { [Op.in]: tagSlugs } },
          required: true, // INNER JOIN: only jobs with these tags
          through: { attributes: [] }, // Exclude junction table data
        };
      }
    }

    // Step 5: Validate sorting parameters
    // Only allow specific fields to prevent SQL injection via sort
    const validSortFields = ["createdAt", "salary_min", "salary_max"];
    const sortField = validSortFields.includes(sort_by) ? sort_by : "createdAt";
    // Only allow 'asc' or 'desc', default to 'desc' (newest first)
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    // Step 6: Check user role for additional data inclusion
    // Only candidates need saved job status
    const currentUser = req.currUser;
    const isCandidate = currentUser && currentUser.role === "candidate";

    // Step 7: Define includes for eager loading related data
    // Always include company data for job listings
    const include = [
      {
        model: company,
        as: "companies",
        attributes: ["id", "name", "logo_url"], // Only necessary fields
      },
    ];

    // Add tag include based on filtering
    if (tagInclude) {
      include.push(tagInclude);
    } else {
      // Include all tags without filtering
      include.push({
        model: tags,
        as: "RelatedTags",
        attributes: ["id", "name", "slug"],
        through: { attributes: [] },
      });
    }

    // Step 8: Fetch jobs with all filters and includes
    // Use findAll with optimized options
    const jobsList = await job.findAll({
      where,
      include,
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
      order: [[sortField, sortOrder]],
      limit: limitNum,
      offset,
      subQuery: false, // Avoid subqueries for better performance with joins
    });

    // Step 9: Get total count for pagination metadata
    // Use count with distinct and include to match the filtered results
    const total = await job.count({
      where,
      distinct: true, // Count distinct jobs (important for many-to-many)
      col: "id", // Count on primary key
      include: tagInclude ? [tagInclude] : [], // Include tag filter in count
    });

    // Step 10: Convert Sequelize instances to plain objects
    // This removes Sequelize metadata and improves JSON serialization
    let data = jobsList.map((row) => row.toJSON());

    // Step 11: Add candidate-specific data (saved jobs)
    if (isCandidate && currentUser.id) {
      try {
        // Fetch saved job IDs for the current user
        const savedRows = await saved_jobs.findAll({
          where: { user_id: currentUser.id },
          attributes: ["job_id"], // Only need job_id
        });

        console.log("savedRows", savedRows);
        // Use Set for O(1) lookup performance
        const savedIds = new Set(savedRows.map((row) => row.job_id));

        // Add is_saved flag to each job
        data = data.map((item) => ({
          ...item,
          is_saved: savedIds.has(item.id),
        }));
      } catch (savedError) {
        // Log error but don't fail the entire request
        console.error("Error fetching saved jobs:", savedError);
        // Continue without saved status (graceful degradation)
      }
    }

    // Step 12: Return successful response with data and pagination metadata
    return res.status(200).json({
      data,
      meta: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum), // Calculate total pages
        limit: limitNum,
      },
    });
  } catch (error) {
    // Comprehensive error handling
    console.error("getAllJobs error:", error);

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

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.currUser; // Authenticated user, if any

    // Step 1: Fetch job with basic includes
    const jobData = await job.findByPk(id, {
      include: [
        {
          model: company,
          as: "companies",
          attributes: [
            "id",
            "name",
            "logo_url",
            "website",
            "location",
            "size",
            "description",
          ],
        },
        {
          model: user,
          as: "users", // Alias for poster (recruiter)
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: tags,
          as: "RelatedTags",
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "job_type",
        "work_mode",
        "location",
        "salary_min",
        "salary_max",
        "status",
        "expires_at",
      ],
    });

    // Step 2: Check if job exists
    if (!jobData) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found",
      });
    }

    // Step 3: Check draft status permissions
    if (
      jobData.status === "draft" &&
      (!currentUser || currentUser.id !== jobData.posted_by)
    ) {
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found",
      });
    }

    // Step 4: Convert to plain object for manipulation
    let responseData = jobData.toJSON();

    // Step 5: Add application_count using subquery
    const applicationCount = await application.count({
      where: { job_id: id },
    });
    responseData.application_count = applicationCount;

    // Step 6: Add candidate-specific fields if authenticated candidate
    if (currentUser && currentUser.role === "candidate") {
      // Check if saved
      const savedJob = await saved_jobs.findOne({
        where: { user_id: currentUser.id, job_id: id },
      });
      responseData.is_saved = !!savedJob;

      // Check my_application
      const myApp = await application.findOne({
        where: { applicant_id: currentUser.id, job_id: id },
        attributes: ["id", "status", "applied_at"],
      });
      if (myApp) {
        responseData.my_application = myApp.toJSON();
      }
    }

    // Step 7: Return response
    return res.status(200).json({
      data: responseData,
    });
  } catch (error) {
    console.error("getJobById error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to fetch job details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateJobById = async (req, res) => {
  const { id } = req.params;

  const transaction = await db.sequelize.transaction();

  try {
    const options = Object.keys(req.body);
    const specificJob = await job.findByPk(id, { transaction });

    const isAdmin = req.role == "admin";
    const isPoster =
      req.role == "recruiter" && specificJob.posted_by == req.currUser.id;

    if (!(isAdmin || isPoster)) {
      await transaction.rollback();
      return res.status(404).json({
        code: "ACCESS DENIED",
        message: "INVALID PRIVILEGE",
      });
    }

    if (!specificJob) {
      await transaction.rollback();
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found",
      });
    }

    // Validate and update each option
    for (const option of options) {
      if (
        option === "status" &&
        !(
          req.body[option] === "active" ||
          req.body[option] === "closed" ||
          req.body[option] === "draft"
        )
      ) {
        await transaction.rollback();
        return res.status(400).json({
          code: "BAD_OPTION_FOR_STATUS",
          message: "Invalid Status option",
        });
      }

      if (
        option === "job_type" &&
        !(
          req.body[option] === "full-time" ||
          req.body[option] === "part-time" ||
          req.body[option] === "contract" ||
          req.body[option] === "internship"
        )
      ) {
        await transaction.rollback();
        return res.status(400).json({
          code: "BAD_OPTION_FOR_JOB_TYPE",
          message: "Invalid TYPE option",
        });
      }

      if (
        option === "work_mode" &&
        !(
          req.body[option] === "remote" ||
          req.body[option] === "onsite" ||
          req.body[option] === "hybrid"
        )
      ) {
        await transaction.rollback();
        return res.status(400).json({
          code: "BAD_OPTION_FOR_WORK_MODE",
          message: "Invalid WORK MODE option",
        });
      }

      if (option === "tag_ids") {
        const tagsPresent = await job_tags.findAll({
          where: {
            job_id: id,
          },
          attributes: ["tag_id"],
          raw: true,
        });

        const tag_ids = req.body["tag_ids"];

        const existingTagIds = tagsPresent.map((t) => t.tag_id);

        const isDifferent =
          existingTagIds.length !== tag_ids.length ||
          !existingTagIds.every((id) => tag_ids.includes(id));

        // Handle tag updates separately
        if (isDifferent) {
          const clearJobsWithId = await job_tags.destroy(
            {
              where: {
                job_id: id,
              },
            },
            { transaction },
          );

          for (const tagId of req.body["tag_ids"]) {
            await job_tags.create(
              {
                job_id: id, // Use id from params, not newJob.id
                tag_id: tagId,
              },
              { transaction },
            );
          }
        }
      } else {
        specificJob[option] = req.body[option];
      }
    }

    // Save the job
    await specificJob.save({ transaction });

    // Fetch updated job with includes
    const updatedJob = await job.findByPk(id, {
      include: [
        {
          model: company,
          as: "companies",
          attributes: [
            "id",
            "name",
            "logo_url",
            "website",
            "location",
            "size",
            "description",
          ],
        },
        {
          model: user,
          as: "users",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: tags,
          as: "RelatedTags",
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
        },
      ],
      attributes: [
        "id",
        "title",
        "description",
        "job_type",
        "work_mode",
        "location",
        "salary_min",
        "salary_max",
        "status",
        "expires_at",
      ],
      transaction,
    });

    await transaction.commit();

    return res.status(200).json({
      data: updatedJob,
      message: `Job with id ${id} updated successfully`,
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  const role = req.role;
  const currUser = req.currUser;

  // Start transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Check if job exists
    const jobToDelete = await job.findByPk(id, { transaction });
    if (!jobToDelete) {
      await transaction.rollback();
      return res.status(404).json({
        code: "JOB_NOT_FOUND",
        message: "Job not found",
      });
    }

    // Authorization checks
    const isAdmin = role === "admin";
    const isOwner = role === "recruiter" && jobToDelete.posted_by === currUser.id;

    if (!isAdmin && !isOwner) {
      await transaction.rollback();
      return res.status(403).json({
        code: "ACCESS_DENIED",
        message: "You do not have permission to delete this job",
      });
    }

    if (role === "recruiter") {
      // Soft delete: set status to closed
      jobToDelete.status = "closed";
      await jobToDelete.save({ transaction });
      await transaction.commit();
      return res.status(200).json({
        message: "Job deleted successfully",
      });
    } else if (role === "admin") {
      // Hard delete: remove from database
      await job.destroy({ where: { id }, transaction });
      await transaction.commit();
      return res.status(200).json({
        message: "Job deleted successfully",
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error("deleteJob error:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: error.message,
    });
  }
};

export { createJobs, getAllJobs, getJobById, updateJobById, deleteJob };
