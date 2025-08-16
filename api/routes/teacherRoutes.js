const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Get all teachers with search and filter
router.get("/", auth, async (req, res) => {
  try {
    const search = req.query.search || "";
    const subjectFilter = req.query.subject || "";

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    if (subjectFilter) {
      query.subject = subjectFilter;
    }

    const teachers = await Teacher.find(query)
      .populate("classes", "name")
      .sort({ name: 1 });

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new teacher
router.post("/", auth, roleAuth(["super", "sub"]), async (req, res) => {
  try {
    const {
      name,
      subject,
      contact,
      email,
      gender,
      hireDate,
      degree,
      experience,
      address,
      baseSalary,
    } = req.body;

    if (
      !name ||
      !subject ||
      !email ||
      !gender ||
      !hireDate ||
      !degree ||
      experience === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    const newTeacher = new Teacher({
      name,
      subject,
      contact: contact || "",
      email,
      gender,
      hireDate,
      degree,
      experience,
      address: address || "",
      baseSalary: baseSalary || 0,
      classes: [],
      salaryPayments: [],
    });

    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (err) {
    console.error("Error creating teacher:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update teacher
router.put("/:id", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const {
      name,
      subject,
      contact,
      email,
      gender,
      hireDate,
      degree,
      experience,
      address,
      baseSalary,
    } = req.body;
    const teacherId = req.params.id;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    teacher.name = name || teacher.name;
    teacher.subject = subject || teacher.subject;
    teacher.contact = contact !== undefined ? contact : teacher.contact;
    teacher.email = email || teacher.email;
    teacher.gender = gender || teacher.gender;
    teacher.hireDate = hireDate || teacher.hireDate;
    teacher.degree = degree || teacher.degree;
    teacher.experience =
      experience !== undefined ? experience : teacher.experience;
    teacher.address = address !== undefined ? address : teacher.address;
    teacher.baseSalary =
      baseSalary !== undefined ? baseSalary : teacher.baseSalary;

    const updatedTeacher = await teacher.save();
    res.json(updatedTeacher);
  } catch (err) {
    console.error("Error updating teacher:", err);
    res.status(500).json({ message: err.message });
  }
});

// Assign teacher to classes
router.put("/:id/classes", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const { classIds } = req.body;
    const teacherId = req.params.id;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update teacher's classes
    teacher.classes = classIds;
    await teacher.save();

    // Update classes to reference this teacher
    await Class.updateMany(
      { _id: { $in: classIds } },
      { $addToSet: { teachers: teacherId } }
    );

    // Remove teacher from classes not in the list
    await Class.updateMany(
      { _id: { $nin: classIds }, teachers: teacherId },
      { $pull: { teachers: teacherId } }
    );

    res.json({ message: "Teacher classes updated successfully" });
  } catch (err) {
    console.error("Error updating teacher classes:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete teacher
router.delete("/:id", auth, roleAuth(["super"]), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Remove teacher from all classes
    await Class.updateMany(
      { teachers: teacher._id },
      { $pull: { teachers: teacher._id } }
    );

    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
