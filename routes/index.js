const express = require('express');
const { newUser, loginUser, logout, edituser, deleteUser, upgradeRoll } = require('../controller/user');

const requireAuth = require('../middleware/requireToken');
const {  createJob, allJob, updateJob, deleteJob, findJob, applyJob, getApply, myJob } = require('../controller/job');
const { userProf, updateProfile, getProfile } = require('../controller/profile');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/createToken');
const authMiddleware = require('../middleware/authMiddlware');
const { Auth } = require('../middleware/auth');
const { applicant, openpdf, updateStatus, allApplication } = require('../controller/application');

const routes = express.Router();

routes.post('/signup', newUser);
routes.post('/login', loginUser);
routes.get('/logout', logout);
routes.put('/edituser/:id', edituser);
routes.delete('/deleteuser/:id', deleteUser);

routes.get('/alljob',allJob)
routes.get('/alljob/:id',findJob)
routes.get('/myjob',authMiddleware,myJob)

routes.get('/job/:jobId/applicant',requireAuth,applicant)

routes.get('/allapplication',allApplication)
routes.post('/newApplication',authMiddleware,createJob)
routes.put('/editjob/:id',updateJob)
routes.delete('/deletejob/:id',deleteJob)
routes.get('/applyjob/:id',getApply)
routes.post('/applyjob/:id', authMiddleware, upload.single('resume'), applyJob);
routes.put('/employee',Auth,upgradeRoll)


routes.get('/uploads/:filename',openpdf)
routes.get('/getprofile/:id',getProfile)
routes.post('/profile/:id',upload.single('resume'),userProf)
routes.put('/editprofile/:id',upload.single('resume'),updateProfile)
module.exports = routes;
