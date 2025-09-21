import express from "express";
import { get } from "mongoose";
import { getJobById, getJobs } from "../controllers/jobController.js";

const router = express.Router();

//route to get all job data
router.get("/",getJobs);

//route to get job by id
router.get("/:id",getJobById);

export default router;