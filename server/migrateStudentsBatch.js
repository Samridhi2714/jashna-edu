
import "dotenv/config";
import mongoose from "mongoose";
import Student from "./models/Student.js";
import Batch from "./models/Batch.js";

const migrateStudentsBatch = async () => {
  try {
    // 1. Connect to the existing MongoDB database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    // 2. Find the new batch using its existing ID
    const newBatch = await Batch.findById(
      "6accc4b8e603050b99cc60aa"
    );

    if (!newBatch || !newBatch.isActive) {
      throw new Error(
        "Target batch was not found or is inactive. No students were updated."
      );
    }

    console.log(`Target batch: ${newBatch.timing}`);

    // 3. Identify only the two intended students
    const targetStudentIds = [
      "6abcf9466317f686a0a28fbc", // Varun
      "6abd0c636317f686a0a2910f", // Anshika Kaur
    ];

    const students = await Student.find({
      _id: { $in: targetStudentIds },
    });

    if (students.length !== 2) {
      throw new Error(
        `Expected exactly 2 students, but found ${students.length}. No students were updated.`
      );
    }

    // 4. Validate both records before making any changes
    const alreadyMigrated = students.every(
      (student) =>
        student.batchId?.toString() === newBatch._id.toString() &&
        student.batch === newBatch.timing
    );

    if (alreadyMigrated) {
      console.log("Both students are already assigned to the target batch.");
      return;
    }

    const allHaveLegacyBatch = students.every(
      (student) => student.batch === "5:30"
    );

    if (!allHaveLegacyBatch) {
      throw new Error(
        "Unexpected batch value detected. No students were updated. Please inspect both student records."
      );
    }

    // 5. Update only the two specified students
    const result = await Student.updateMany(
      {
        _id: { $in: targetStudentIds },
        batch: "5:30",
      },
      {
        $set: {
          batch: newBatch.timing,
          batchId: newBatch._id,
        },
      }
    );

    if (result.matchedCount !== 2 || result.modifiedCount !== 2) {
      throw new Error(
        `Migration verification failed. Matched: ${result.matchedCount}, modified: ${result.modifiedCount}. Please inspect the records.`
      );
    }

    // 6. Verify the updated records
    const updatedStudents = await Student.find({
      _id: { $in: targetStudentIds },
    }).select("name username batch batchId");

    console.log("\nMigration successful!");
    console.table(
      updatedStudents.map((student) => ({
        name: student.name,
        username: student.username,
        batch: student.batch,
        batchId: student.batchId?.toString() ?? "Not assigned",
      }))
    );
  } catch (error) {
    console.error("\nMigration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
};

migrateStudentsBatch();
