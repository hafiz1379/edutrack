const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all students
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().populate('class');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new student
router.post('/', auth, roleAuth(['super', 'sub']), async (req, res) => {
  try {
    const { name, class: classId } = req.body;
    
    // Validate input
    if (!name || !classId) {
      return res.status(400).json({ message: 'Name and class are required' });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: 'Invalid class ID' });
    }

    // Create new student
    const newStudent = new Student({
      name,
      class: classId,
      feeStatus: [],
      grades: []
    });

    const savedStudent = await newStudent.save();

    // Update class with new student
    await Class.findByIdAndUpdate(classId, {
      $push: { students: savedStudent._id }
    });

    res.status(201).json(savedStudent);
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update student (only super admin)
router.put('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { name, class: classId } = req.body;
    const studentId = req.params.id;
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If class is being changed, validate the new class
    if (classId && classId !== student.class.toString()) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({ message: 'Invalid class ID' });
      }

      // Remove student from old class
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: studentId }
      });

      // Add student to new class
      await Class.findByIdAndUpdate(classId, {
        $push: { students: studentId }
      });
    }

    // Update student details
    student.name = name || student.name;
    if (classId) student.class = classId;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: err.message });
  }
});

// Remove student from class
router.delete('/:id/class', auth, roleAuth(['super']), async (req, res) => {
  try {
    const studentId = req.params.id;
    
    // Find the student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // If student is not in any class, return error
    if (!student.class) {
      return res.status(400).json({ message: 'Student is not in any class' });
    }

    const classId = student.class;

    // Remove student from class
    await Class.findByIdAndUpdate(classId, {
      $pull: { students: studentId }
    });

    // Remove class from student
    student.class = null;
    await student.save();

    res.json({ message: 'Student removed from class successfully' });
  } catch (err) {
    console.error('Error removing student from class:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete student
router.delete('/:id', auth, roleAuth(['super']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from class
    await Class.findByIdAndUpdate(student.class, {
      $pull: { students: student._id }
    });

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
