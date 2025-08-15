const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, role: admin.role });
});

module.exports = router;
