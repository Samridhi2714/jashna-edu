import mongoose from "mongoose";

const adminOtpSchema = new mongoose.Schema(
{
admin: {
type: mongoose.Schema.Types.ObjectId,
ref: "Admin",
required: true,
index: true,
},

otpHash: {
  type: String,
  required: true,
},

expiresAt: {
  type: Date,
  required: true,
},

attempts: {
  type: Number,
  default: 0,
  min: 0,
},

resendAfter: {
  type: Date,
  required: true,
},

verifiedAt: {
  type: Date,
  default: null,
},

consumedAt: {
  type: Date,
  default: null,
},

},
{
timestamps: true,
}
);

// MongoDB automatically removes expired records.
// The backend must still check expiresAt before accepting an OTP.
adminOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AdminOtp = mongoose.model("AdminOtp", adminOtpSchema);

export default AdminOtp;