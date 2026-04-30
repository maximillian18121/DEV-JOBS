import db from "../models/index.js";

const application = db.Application;
const job = db.Jobs;

const createApplication = async (req, res) => {

    const {id} = req.params;
    const currUser = req.currUser;
    const role = req.role;

    const {cover_letter, recruiter_note} = req.body;

    

    const resumeFile   = req.file;

    const fileURL = null;

    if(resumeFile){
        fileURL = `/uploads/company-logos/${logoFile.filename}`;
    }

    // if(!resumeFile){
    //     return res.status(400).json({
    //           code: "VALIDATION_ERROR",
    //           message: "Please upload resume document."
    //         });
    // }

    if(!cover_letter || !recruiter_note){
        return res.status(400).json({
              code: "VALIDATION_ERROR",
              message: "Please input only valid values in Fields",
            });
    }

    const transaction = await db.sequelize.transaction();

    try {


        const newApplication = await application.create({
            job_id :  id,
            applicant_id: currUser.id,
            cover_letter,
            recruiter_note,
            status:"applied",
            resume_url: fileURL
        }, {transaction});

        console.log("newApplication", newApplication);

        if(!newApplication){
            return res.status(400).json({
              code: "LOGICAL_ERROR",
              message: "Something went wrong !",
            });
        }

        await transaction.commit();

        return res.status(200).json({
            code:`New Application created with id ${newApplication.id} `,
            result: newApplication
        })

        

    } catch (error) {
        await transaction.rollback();
        console.log(error);
        return res.status(400).json({
              code: "LOGICAL_ERROR",
              message: "Something went wrong !",
        });
    }
}

export {createApplication}