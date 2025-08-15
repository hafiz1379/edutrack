const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all teachers
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new teacher (both super and sub admin)
router.post('/', auth, roleAuth(['super', 'sub']), async (req, res) => {
  try {
    const { name, subject, contact } = req.body;
    
    // Validate input
    if (!name || !subject) {
      return res.status(400).json({ message: 'Name and subject are required' });
    }

    const newTeacher = new Teacher({
      name,
      subject,
      contact: contact || ''
    });

    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (err) {
    console.error('Error creating teacher:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update teacher (only super admin)
router.put('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { name, subject, contact } = req.body;
    const teacherId = req.params.id;
    
    // Find the teacher
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update teacher details
    teacher.name = name || teacher.name;
    teacher.subject = subject || teacher.subject;
    teacher.contact = contact !== undefined ? contact : teacher.contact;

    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
  } catch (err) {
    console.error('Error updating teacher:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete teacher (only super admin)
router.delete('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;