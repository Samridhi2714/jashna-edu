import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import Student from "../models/Student.js";

const createTestStudent = async () => {
  try {
    await connectDB();

    const username = "student001";
    const password = "Student@123";

    const existingStudent = await Student.findOne({
      username,
    });

    if (existingStudent) {
      console.log("Test student already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await Student.create({
      name: "Test Student",
      username,
      password: hashedPassword,
      batch: "Test Batch",
      mustChangePassword: true,
      isActive: true,
    });

    console.log("Test student created:");
    console.log({
      id: student._id.toString(),
      username,
      password,
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create test student:", error);
    process.exit(1);
  }
};

createTestStudent();
