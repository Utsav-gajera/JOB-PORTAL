import express from 'express';
import { changeJobApplicationsStatus, changeVisibility, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js';
import upload from '../config/multer.js';
import { protectCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

// register a company
router.post('/register',upload.single('image'), registerCompany);

//company login
router.post('/login', loginCompany);

// get company data
router.get('/company', protectCompany, getCompanyData);

//post a new job
router.post('/post-job', protectCompany, postJob);

//get applicants data for company
router.get('/applicants', protectCompany, getCompanyJobApplicants);

//get company job list
router.get('/list-jobs', protectCompany, getCompanyPostedJobs);

//change application status
router.post('/change-status', protectCompany, changeJobApplicationsStatus);

//change applications visibility
router.post('/change-visibility', protectCompany, changeVisibility);

export default router;