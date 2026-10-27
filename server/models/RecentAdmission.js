import mongoose from "mongoose";

const recentAdmissionSchema = new mongoose.Schema(
{
// Link to the existing student account.
student: {
type: mongoose.Schema.Types.ObjectId,
ref: "Student",
required: true,
unique: true,
},

// Designation displayed on the public website.
// Examples: School Student, College Student, Working Professional.
designation: {
  type: String,
  trim: true,
  default: "",
  maxlength: 100,
},

// Legacy field retained for compatibility with existing records.
// New admission records use designation instead.
courseName: {
  type: String,
  trim: true,
  default: "",
},

// Whether the admin has approved this card for publication.
isPublished: {
  type: Boolean,
  default: false,
},

// Legacy field retained for existing MongoDB records.
// The updated controller no longer requires this field to publish.
publicDisplayConsent: {
  type: Boolean,
  default: false,
},

// Controls the order in which cards appear.
displayOrder: {
  type: Number,
  default: 0,
},

},
{
timestamps: true,
}
);

const RecentAdmission = mongoose.model(
"RecentAdmission",
recentAdmissionSchema
);

export default RecentAdmission;