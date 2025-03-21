const express = require('express');
const router = express.Router();
const meetingController = require('./meeting');

router.get('/', meetingController.allMeeting);

router.get('/view/:id', meetingController.viewMeeting);

router.post('/add', meetingController.addMeeting);

router.put('/:id', meetingController.updateMeeting);

router.delete('/delete/:id', meetingController.deleteMeeting);

router.post('/deleteMany', meetingController.deleteManyMeetings);

module.exports = router;
