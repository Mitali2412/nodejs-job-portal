import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import { createJobController, deleteJobController, getAllJobsController, jobStatsController, updateJobController } from "../controller/jobsControler.js";

const router = express.Router();

//routes
//CREATE JOB POST
router.post("/create-job", userAuth, createJobController);

//get jobs || get
router.get("get-job", userAuth, getAllJobsController);


//update jobs || PUT ||PATCH
router.patch("update-job/:id", userAuth, updateJobController);

//DELETE JOBS || DELETE
router.delete("/delete-job/:id", userAuth, deleteJobController);

//JOBS STATS filter|| GET
router.get("/job-stats/:id", userAuth, jobStatsController);

export default router;
