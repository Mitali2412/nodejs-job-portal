import jobsModel from "../models/jobsModel.js";
import mongoose from "mongoose";
import moment from "moment";

////**CREATE JOB */
export const createJobController = async (req, res, next) => {
    const { company, position, } = req.body;
    if (!company || !position) {
        next('Please provide all fields');
    }
    req.body.createdBy = req.user.userId;
    const job = await jobsModel.create(req.body);
    res.status(201).json(
        { job },
    );
};
////** GET JOB* */
export const getAllJobsController = async (req, res, next) => {
    const { status, workType, search, sort } = req.query;
    const queryObject = {
        createdBy: req.user.userId,
    };
    //logic filters
    if (status && status !== "all") {
        queryObject.status = status;
    }
    if (workType && workType !== "all") {
        queryObject.workType = workType;
    }
    if (search) {
        queryObject.position = { $regex: search, $options: "i" };
    }
    let queryResult = jobsModel.find(queryObject);

    if (sort === "latest") {
        queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "oldest") {
        queryResult = queryResult.sort("createdAt");
    }
    if (sort === "a-z") {
        queryResult = queryResult.sort("position");
    }
    if (sort === "z-a") {
        queryResult = queryResult.sort("-position");
    }
    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const jobs = await queryResult;
    queryResult = queryResult.skip(skip).limit(limit);
    //jobs count
    const totalJobs = await jobsModel.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    //const jobs = await jobsModel.find({ createdBy: req.user.userId });
    res.status(200).json({
        totalJobs,
        jobs,
        numOfPage,
    });
};


//update job
export const updateJobController = async (req, res, next) => {
    const { id } = req.params;
    const { company, position } = req.body;

    //validation
    if (!company || !position) {
        next('Please provide all fields');
    }
    //find job
    const job = await jobsModel.findOne({ _id: id });

    //validation
    if (!job) {
        next(`No jobs found with this ${id}`);
    }

    if (!req.user.userId === job.createdBy.toString()) {

        next("You're nor atuthorised to update this job");
        return;
    }
    const updateJob = await jobsModel.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,

    });

    //res
    res.status(200).json(
        { updateJob }
    );
};

//DELETE JOBS
export const deleteJobController = async (req, res, next) => {
    const { id } = req.params;
    //find job
    const job = await jobsModel.findOne({ _id: id })
    //validation
    if (!job) {
        next(`No job found with this ${id} `);
    }
    if (!req.user.userId === job.createdBy.toString()) {
        next("you're not authorised to delete this job");
        return;
    }
    await job.deleteOne();
    res.status(200).json({ message: 'Success,Job deleted' });
};

/////////JOBS STATS AND FILTERS
export const jobStatsController = async (req, res) => {
    const stats = await jobsModel.aggregate([
        /// search by user job
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId),
            },

        },
        {
            $group: {
                _id: "$status", count: { $sum: 1 },
            },
        }
    ]);

    //defaults stats
    const defaultStats = {
        pending: stats.pending || 0,
        reject: stats.reject || 0,
        interview: stats.interview || 0,
    }
    //monthly yearly
    let monthlyApplicatiin = await jobsModel.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId),
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: {
                    $sum: 1,
                }
            },

        }
    ]);
    monthlyApplicatiin = monthlyApplicatiin.map(item => {
        const { _id: { year, month }, count } = item;
        const date = moment().month.apply(month - 1).year.format('MMM y');
        return { date, count };
    }).reverse();
    res.status(200).json({ totalJobs: stats.length, defaultStats, monthlyApplicatiin });
};