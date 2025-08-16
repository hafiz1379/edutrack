const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Get all students with pagination, search and filter
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const classFilter = req.query.class || "";

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (classFilter) {
      query.class = classFilter;
    }

    const students = await Student.find(query)
      .populate("class", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(query);

    res.json({
      students,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new student
router.post("/", auth, roleAuth(["super", "sub"]), async (req, res) => {
  try {
    const {
      name,
      class: classId,
      studentId,
      gender,
      dateOfBirth,
      parentContact,
    } = req.body;

    if (
      !name ||
      !classId ||
      !studentId ||
      !gender ||
      !dateOfBirth ||
      !parentContact
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({ message: "Student ID already exists" });
    }

    // Check if class exists
    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ message: "Invalid class ID" });
    }

    const newStudent = new Student({
      name,
      class: classId,
      studentId,
      gender,
      dateOfBirth,
      parentContact,
      feeStatus: [],
    });

    const savedStudent = await newStudent.save();

    // Update class with new student
    await Class.findByIdAndUpdate(classId, {
      $push: { students: savedStudent._id },
    });

    res.status(201).json(savedStudent);
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update student
router.put("/:id", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const {
      name,
      class: classId,
      studentId,
      gender,
      dateOfBirth,
      parentContact,
    } = req.body;
    const studentIdParam = req.params.id;

    const student = await Student.findById(studentIdParam);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if studentId is being changed and already exists
    if (studentId && studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: "Student ID already exists" });
      }
    }

    // If class is being changed, validate the new class
    if (classId && classId !== student.class.toString()) {
      const classExists = await Class.findById(classId);
      if (!classExists) {
        return res.status(400).json({ message: "Invalid class ID" });
      }

      // Remove student from old class
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: studentIdParam },
      });

      // Add student to new class
      await Class.findByIdAndUpdate(classId, {
        $push: { students: studentIdParam },
      });
    }

    student.name = name || student.name;
    if (classId) student.class = classId;
    if (studentId) student.studentId = studentId;
    if (gender) student.gender = gender;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (parentContact) student.parentContact = parentContact;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete student
router.delete("/:id", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from class
    await Class.findByIdAndUpdate(student.class, {
      $pull: { students: student._id },
    });

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
