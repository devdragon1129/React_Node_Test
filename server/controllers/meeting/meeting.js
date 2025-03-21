const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const allMeeting = async (req, res) => {
  try {
    const { createBy } = req.query;
    let query = { deleted: false };
    if (createBy) {
      query.createBy = createBy;
    }
    const meetings = await MeetingHistory.find(query);
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const viewMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ success: false, message: "Invalid meeting id" });
    }
    const meeting = await MeetingHistory.findOne({ _id: meetingId, deleted: false });
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addMeeting = async (req, res) => {
  try {
    const meetingData = req.body;
    const meeting = new MeetingHistory(meetingData);
    await meeting.save();
    res.status(201).json({ success: true, message: "Meeting added successfully", data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ success: false, message: "Invalid meeting id" });
    }
    const updateData = req.body;
    const updatedMeeting = await MeetingHistory.findOneAndUpdate(
      { _id: meetingId, deleted: false },
      updateData,
      { new: true }
    );
    if (!updatedMeeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.status(200).json({ success: true, message: "Meeting updated successfully", data: updatedMeeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const meetingId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(meetingId)) {
      return res.status(400).json({ success: false, message: "Invalid meeting id" });
    }
    const meeting = await MeetingHistory.findByIdAndUpdate(
      meetingId,
      { deleted: true },
      { new: true }
    );
    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found" });
    }
    res.status(200).json({ success: true, message: "Meeting deleted successfully", data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteManyMeetings = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: "Invalid input, expected an array of meeting ids" });
    }
    const result = await MeetingHistory.updateMany(
      { _id: { $in: ids }, deleted: false },
      { deleted: true }
    );
    const modifiedCount = result.nModified || result.modifiedCount || 0;
    res.status(200).json({ success: true, message: `${modifiedCount} meeting(s) deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addMeeting, allMeeting, viewMeeting, updateMeeting, deleteMeeting, deleteManyMeetings };
