import jwt from "jsonwebtoken";
import Student from "../models/Student.js";

const protectStudent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "student") {
      return res.status(403).json({
        message: "Student access required",
      });
    }

    if (!decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    const student = await Student.findById(decoded.id)
      .select("_id isActive mustChangePassword enrollmentStatus")
      .lean();

    if (!student || student.isActive !== true) {
      return res.status(401).json({
        message: "Your account is inactive or no longer available.",
      });
    }

    req.student = {
      ...decoded,
      id: student._id.toString(),
      isActive: student.isActive,
      mustChangePassword: student.mustChangePassword,
      enrollmentStatus: student.enrollmentStatus,
    };

    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Student authentication error:", error);

    return res.status(500).json({
      message: "Unable to verify authentication.",
    });
  }
};

export default protectStudent;