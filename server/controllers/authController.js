import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import crypto from "node:crypto";
import AdminOtp from "../models/AdminOtp.js";
import { sendAdminOtpEmail } from "../services/emailService.js";
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create admin",
      error: error.message,
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};
export const verifyAdmin = async (req, res) => {
  res.status(200).json({
    authenticated: true,
    admin: req.admin,
  });
};
export const requestAdminPasswordOtp = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    const now = new Date();

    let challenge = await AdminOtp.findOne({
      admin: admin._id,
    });

    // Allow only one OTP request per cooldown period.
    if (challenge && challenge.resendAfter > now) {
      const retryAfterSeconds = Math.ceil(
        (challenge.resendAfter.getTime() - now.getTime()) / 1000
      );

      return res.status(429).json({
        message: "Please wait before requesting another OTP.",
        retryAfterSeconds,
      });
    }

    // Generate a cryptographically secure six-digit OTP.
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store a hash rather than the original OTP.
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const resendAfter = new Date(now.getTime() + 60 * 1000);

    if (!challenge) {
      challenge = new AdminOtp({
        admin: admin._id,
        otpHash,
        expiresAt,
        resendAfter,
        attempts: 0,
        verifiedAt: null,
        consumedAt: null,
      });
    } else {
      challenge.otpHash = otpHash;
      challenge.expiresAt = expiresAt;
      challenge.resendAfter = resendAfter;
      challenge.attempts = 0;
      challenge.verifiedAt = null;
      challenge.consumedAt = null;
    }

    await challenge.save();

    try {
      // Always send to the email registered in the database.
      await sendAdminOtpEmail(admin.email, otp);
    } catch (emailError) {
      // Invalidate the challenge if email delivery fails.
      await AdminOtp.deleteOne({
        _id: challenge._id,
      });

      console.error("Admin OTP email delivery failed:", emailError.message);

      return res.status(502).json({
        message:
          "Unable to send the verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "Verification code sent to your registered email.",
      expiresInMinutes: 10,
      resendAfterSeconds: 60,
    });
  } catch (error) {
    console.error("Admin OTP request failed:", error);

    return res.status(500).json({
      message: "Failed to request password verification.",
    });
  }
};

export const verifyAdminPasswordOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        message: "Please enter a valid six-digit OTP.",
      });
    }

    const challenge = await AdminOtp.findOne({
      admin: req.admin.id,
      consumedAt: null,
    });

    if (!challenge) {
      return res.status(400).json({
        message: "No active OTP request found. Please request a new OTP.",
      });
    }

    const now = new Date();

    if (challenge.expiresAt <= now) {
      await AdminOtp.deleteOne({ _id: challenge._id });

      return res.status(400).json({
        message: "Your OTP has expired. Please request a new one.",
      });
    }

    if (challenge.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    if (challenge.verifiedAt) {
      return res.status(400).json({
        message: "OTP already verified. Please continue to change your password.",
      });
    }

    const isValid = await bcrypt.compare(
      otp,
      challenge.otpHash
    );

    if (!isValid) {
      challenge.attempts += 1;

      if (challenge.attempts >= 5) {
        challenge.consumedAt = now;
      }

      await challenge.save();

      return res.status(
        challenge.attempts >= 5 ? 429 : 400
      ).json({
        message:
          challenge.attempts >= 5
            ? "Too many incorrect attempts. Please request a new OTP."
            : "Incorrect OTP. Please try again.",
        attemptsRemaining: Math.max(0, 5 - challenge.attempts),
      });
    }

    challenge.verifiedAt = now;

    await challenge.save();

    return res.status(200).json({
      message: "OTP verified successfully. You may now change your password.",
    });
  } catch (error) {
    console.error("Admin OTP verification failed:", error);

    return res.status(500).json({
      message: "Failed to verify OTP.",
    });
  }
};

export const changeAdminPasswordWithOtp = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "New password and confirmation are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    const now = new Date();

    // Atomically consume the verified challenge.
    // A challenge can authorize only one password change.
    const challenge = await AdminOtp.findOneAndUpdate(
      {
        admin: admin._id,
        verifiedAt: {
          $gte: new Date(now.getTime() - 5 * 60 * 1000),
        },
        expiresAt: { $gt: now },
        consumedAt: null,
      },
      {
        $set: { consumedAt: now },
      },
      { new: true }
    );

    if (!challenge) {
      return res.status(400).json({
        message:
          "OTP verification is missing or expired. Please verify a new OTP.",
      });
    }

    admin.password = await bcrypt.hash(newPassword, 12);

    await admin.save();

    return res.status(200).json({
      message: "Admin password changed successfully.",
    });
  } catch (error) {
    console.error("Admin password change failed:", error);

    return res.status(500).json({
      message: "Failed to change admin password.",
    });
  }
};