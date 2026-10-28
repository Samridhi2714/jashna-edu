import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import cloudinary from "../config/cloudinary.js";

/*
=========================================================
HELPER
=========================================================
*/

const getAuthenticatedStudent = async (studentId) => {
  const student = await Student.findById(studentId);

  if (!student) {
    return {
      error: {
        status: 404,
        message: "Student account not found",
      },
    };
  }

  if (!student.isActive) {
    return {
      error: {
        status: 403,
        message: "This student account has been deactivated",
      },
    };
  }

  return { student };
};

/*
=========================================================
STUDENT LOGIN
=========================================================
*/

export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const student = await Student.findOne({
      username: username.toLowerCase(),
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        message: "This student account has been deactivated",
      });
    }

    const passwordMatch = await bcrypt.compare(password, student.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: student._id,
        username: student.username,
        role: "student",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        batch: student.batch,
        mustChangePassword: student.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Student login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
};

/*
=========================================================
VERIFY STUDENT
=========================================================
*/

export const verifyStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        message: "This student account has been deactivated",
      });
    }

    res.status(200).json({
      authenticated: true,
      student,
    });
  } catch (error) {
    console.error("Student verification error:", error);

    res.status(500).json({
      message: "Failed to verify student",
    });
  }
};

/*
=========================================================
CHANGE STUDENT PASSWORD
=========================================================
*/

export const changeStudentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long",
      });
    }

    const student = await Student.findById(req.student.id);

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      student.password,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    student.password = await bcrypt.hash(newPassword, 12);
    student.mustChangePassword = false;

    await student.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Student password change error:", error);

    res.status(500).json({
      message: "Failed to change password",
    });
  }
};

/*
=========================================================
STUDENT PROFILE IMAGE
=========================================================

PATCH /api/auth/student/profile-image

The student can upload their own profile picture.
=========================================================
*/

export const uploadStudentProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided",
      });
    }

    const { student, error } = await getAuthenticatedStudent(req.student.id);

    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "jashna-edu/student-profiles",
          resource_type: "image",
        },
        (uploadError, result) => {
          if (uploadError) {
            reject(uploadError);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    student.profileImage = uploadResult.secure_url;

    await student.save();

    return res.status(200).json({
      message: "Profile picture updated successfully",
      imageUrl: student.profileImage,
    });
  } catch (error) {
    console.error("Student profile image upload error:", error);

    return res.status(500).json({
      message: "Profile picture upload failed",
      error: error.message,
    });
  }
};

/*
=========================================================
STUDENT STARTING-POINT VIDEO
=========================================================
*/

export const uploadStartingPointVideo = async (req, res) => {
  let uploadResult = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No video file provided",
      });
    }

    const { student, error } = await getAuthenticatedStudent(req.student.id);

    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    /*
    -------------------------------------------------------
    UPLOAD VIDEO TO CLOUDINARY
    -------------------------------------------------------
    */

    uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "jashna-edu/student-starting-videos",
          resource_type: "video",
        },
        (uploadError, result) => {
          if (uploadError) {
            reject(uploadError);
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(req.file.buffer);
    });

    /*
    -------------------------------------------------------
    CHECK VIDEO DURATION
    -------------------------------------------------------
    */

    const duration = Number(uploadResult.duration || 0);

    const MIN_DURATION = 15;
    const MAX_DURATION = 180;

    if (duration < MIN_DURATION) {
      /*
      Delete invalid upload from Cloudinary
      */

      if (uploadResult.public_id) {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          resource_type: "video",
        });
      }

      return res.status(400).json({
        message: "Your starting-point video must be at least 15 seconds long.",
      });
    }

    if (duration > MAX_DURATION) {
      /*
      Delete invalid upload from Cloudinary
      */

      if (uploadResult.public_id) {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          resource_type: "video",
        });
      }

      return res.status(400).json({
        message: "Your starting-point video cannot be longer than 3 minutes.",
      });
    }

    /*
    -------------------------------------------------------
    SAVE VIDEO
    -------------------------------------------------------
    */

    student.startingPointVideo = uploadResult.secure_url;

    student.startingPointVideoType = "upload";

    await student.save();

    return res.status(200).json({
      message: "Starting-point video uploaded successfully",
      videoUrl: student.startingPointVideo,
      videoType: student.startingPointVideoType,
      duration,
    });
  } catch (error) {
    console.error("Starting-point video upload error:", error);

    /*
    -------------------------------------------------------
    CLEAN UP IF CLOUDINARY UPLOAD SUCCEEDED BUT
    DATABASE SAVE / PROCESSING FAILED
    -------------------------------------------------------
    */

    if (uploadResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, {
          resource_type: "video",
        });
      } catch (cleanupError) {
        console.error("Failed to clean up Cloudinary video:", cleanupError);
      }
    }

    return res.status(500).json({
      message: "Starting-point video upload failed",
      error: error.message,
    });
  }
};

/*
=========================================================
STUDENT STARTING-POINT VIDEO LINK
=========================================================

PATCH /api/auth/student/starting-point-video-link

Currently supports:
- YouTube
- YouTube Shorts
- youtu.be
=========================================================
*/

export const saveStartingPointVideoLink = async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || typeof videoUrl !== "string") {
      return res.status(400).json({
        message: "Please provide a video link",
      });
    }

    const cleanUrl = videoUrl.trim();

    /*
    -------------------------------------------------------
    VALIDATE URL
    -------------------------------------------------------
    */

    let parsedUrl;

    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      return res.status(400).json({
        message: "Please provide a valid video link",
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");

    const isYouTube =
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be";

    if (!isYouTube) {
      return res.status(400).json({
        message: "Please use a valid YouTube or YouTube Shorts link.",
      });
    }

    /*
    -------------------------------------------------------
    CHECK AUTHENTICATED STUDENT
    -------------------------------------------------------
    */

    const { student, error } = await getAuthenticatedStudent(req.student.id);

    if (error) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    /*
    -------------------------------------------------------
    SAVE LINK
    -------------------------------------------------------
    */

    student.startingPointVideo = cleanUrl;
    student.startingPointVideoType = "embed";

    await student.save();

    return res.status(200).json({
      message: "Starting-point video link saved successfully",
      videoUrl: student.startingPointVideo,
      videoType: student.startingPointVideoType,
    });
  } catch (error) {
    console.error("Starting-point video link error:", error);

    return res.status(500).json({
      message: "Unable to save starting-point video link",
      error: error.message,
    });
  }
};
