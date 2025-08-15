const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all classes with student count
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find().populate({
      path: 'students',
      select: 'name'
    });
    
    const classesWithCount = classes.map(cls => ({
      ...cls.toObject(),
      studentCount: cls.students.length
    }));
    
    res.json(classesWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get students of a specific class
router.get('/:id/students', auth, async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.id })
      .populate('class', 'name')
      .select('name class feeStatus grades');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new class
router.post('/', auth, roleAuth(['super', 'sub']), async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Class name is required' });
    }

    const newClass = new Class({ name, students: [] });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    console.error('Error creating class:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update class
router.put('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { name } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(updatedClass);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete class
router.delete('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    // Remove class reference from students
    await Student.updateMany(
      { class: req.params.id },
      { $unset: { class: 1 } }
    );
    
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;