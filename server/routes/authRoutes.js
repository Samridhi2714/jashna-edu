import express from "express";

import {
  registerAdmin,
  loginAdmin,
  verifyAdmin,
  requestAdminPasswordOtp,
  verifyAdminPasswordOtp,
  changeAdminPasswordWithOtp,
} from "../controllers/authController.js";

import {
  loginStudent,
  verifyStudent,
  changeStudentPassword,
  uploadStudentProfileImage,
  uploadStartingPointVideo,
  saveStartingPointVideoLink,
} from "../controllers/studentAuthController.js";

import protect from "../middleware/authMiddleware.js";
import protectStudent from "../middleware/studentAuthMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";
import videoUpload from "../middleware/videoUploadMiddleware.js";

const router = express.Router();

/* =========================
   ADMIN AUTH
========================= */

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/verify", protect, verifyAdmin);
/* ADMIN PASSWORD CHANGE WITH EMAIL OTP */
router.post("/admin/password/request-otp", protect, requestAdminPasswordOtp);

router.post("/admin/password/verify-otp", protect, verifyAdminPasswordOtp);

router.post("/admin/password/change", protect, changeAdminPasswordWithOtp);
/* =========================
   STUDENT AUTH
========================= */

router.post("/student/login", loginStudent);

router.get("/student/verify", protectStudent, verifyStudent);

router.post("/student/change-password", protectStudent, changeStudentPassword);

/* =========================
   STUDENT PROFILE IMAGE
========================= */

router.patch(
  "/student/profile-image",
  protectStudent,
  upload.single("image"),
  uploadStudentProfileImage,
);

/* =========================
   STUDENT STARTING-POINT VIDEO
========================= */

/*
---------------------------------------------------------
UPLOAD FIRST-DAY VIDEO

PATCH /api/auth/student/starting-point-video

Maximum:
100 MB

Duration:
15 seconds - 3 minutes
---------------------------------------------------------
*/

router.patch(
  "/student/starting-point-video",
  protectStudent,
  videoUpload.single("video"),
  uploadStartingPointVideo,
);

/*
---------------------------------------------------------
SAVE EMBEDDED VIDEO LINK

PATCH /api/auth/student/starting-point-video-link

Body:

{
  "videoUrl": "https://youtube.com/..."
}
---------------------------------------------------------
*/

router.patch(
  "/student/starting-point-video-link",
  protectStudent,
  saveStartingPointVideoLink,
);

export default router;
