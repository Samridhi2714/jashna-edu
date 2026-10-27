import mongoose from "mongoose";

import Student from "../models/Student.js";
import RecentAdmission from "../models/RecentAdmission.js";

/*
HELPERS

*/

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getStudentForDisplay = (student) => {
if (!student) return null;

return {
_id: student._id,
name: student.name,
profileImage: student.profileImage || "",
batch: student.batch || "",
enrollmentStatus: student.enrollmentStatus,
isActive: student.isActive,
};
};

const getDisplayDesignation = (admission) =>
admission.designation?.trim() ||
admission.courseName?.trim() ||
"Designation not specified";

/*

GET ELIGIBLE STUDENTS

GET /api/recent-admissions/students

*/

export const getEligibleStudents = async (req, res) => {
try {
const students = await Student.find({
isActive: true,
enrollmentStatus: "ongoing",
})
.select("_id name profileImage batch enrollmentStatus")
.sort({ name: 1 })
.lean();

return res.status(200).json({
  success: true,
  students,
});

} catch (error) {
console.error("Get eligible students error:", error);

return res.status(500).json({
  success: false,
  message: "Unable to fetch students.",
});

}
};

/*

GET ALL ADMISSION RECORDS

GET /api/recent-admissions

*/

export const getRecentAdmissions = async (req, res) => {
try {
const admissions = await RecentAdmission.find()
.populate({
path: "student",
select:
"_id name username profileImage batch enrollmentStatus isActive",
})
.sort({ displayOrder: 1, createdAt: -1 })
.lean();

return res.status(200).json({
  success: true,
  admissions,
});

} catch (error) {
console.error("Get recent admissions error:", error);

return res.status(500).json({
  success: false,
  message: "Unable to fetch recent admissions.",
});

}
};

/*

CREATE ADMISSION RECORD

POST /api/recent-admissions

Body:
{
"studentId": "...",
"designation": "College Student"
}

New records are always created unpublished.

*/

export const createRecentAdmission = async (req, res) => {
try {
const { studentId, designation } = req.body;

if (!studentId || !isValidId(studentId)) {
  return res.status(400).json({
    success: false,
    message: "A valid student must be selected.",
  });
}

if (typeof designation !== "string" || !designation.trim()) {
  return res.status(400).json({
    success: false,
    message: "Student designation is required.",
  });
}

const cleanedDesignation = designation.trim();

if (cleanedDesignation.length > 100) {
  return res.status(400).json({
    success: false,
    message: "Designation cannot exceed 100 characters.",
  });
}

const student = await Student.findOne({
  _id: studentId,
  isActive: true,
  enrollmentStatus: "ongoing",
}).select("_id name profileImage");

if (!student) {
  return res.status(404).json({
    success: false,
    message: "Eligible student not found.",
  });
}

if (!student.profileImage) {
  return res.status(400).json({
    success: false,
    message: "This student does not have a profile picture.",
  });
}

const existingAdmission = await RecentAdmission.findOne({
  student: studentId,
});

if (existingAdmission) {
  return res.status(409).json({
    success: false,
    message:
      "An admission record already exists for this student. Manage the existing record instead.",
  });
}

const admission = await RecentAdmission.create({
  student: studentId,
  designation: cleanedDesignation,
  isPublished: false,
});

const populatedAdmission = await RecentAdmission.findById(
  admission._id,
).populate({
  path: "student",
  select:
    "_id name username profileImage batch enrollmentStatus isActive",
});

return res.status(201).json({
  success: true,
  message: "Admission record created. Publish it when you're ready.",
  admission: populatedAdmission,
});

} catch (error) {
console.error("Create recent admission error:", error);

if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "An admission record already exists for this student.",
  });
}

return res.status(500).json({
  success: false,
  message: "Unable to create the admission record.",
});

}
};

/*

UPDATE ADMISSION RECORD

PATCH /api/recent-admissions/

Updates the designation.

Supports the old courseName field for legacy requests.

*/

export const updateRecentAdmission = async (req, res) => {
try {
const { id } = req.params;
const { designation, courseName } = req.body;

if (!isValidId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid admission record ID.",
  });
}

const admission = await RecentAdmission.findById(id);

if (!admission) {
  return res.status(404).json({
    success: false,
    message: "Admission record not found.",
  });
}

if (designation !== undefined) {
  if (typeof designation !== "string" || !designation.trim()) {
    return res.status(400).json({
      success: false,
      message: "Designation cannot be empty.",
    });
  }

  const cleanedDesignation = designation.trim();

  if (cleanedDesignation.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Designation cannot exceed 100 characters.",
    });
  }

  admission.designation = cleanedDesignation;
} else if (courseName !== undefined) {
  // Backward compatibility for existing frontend/API requests.
  if (typeof courseName !== "string" || !courseName.trim()) {
    return res.status(400).json({
      success: false,
      message: "Course name cannot be empty.",
    });
  }

  admission.courseName = courseName.trim();
}

await admission.save();

const updatedAdmission = await RecentAdmission.findById(
  admission._id,
).populate({
  path: "student",
  select:
    "_id name username profileImage batch enrollmentStatus isActive",
});

return res.status(200).json({
  success: true,
  message: "Admission record updated.",
  admission: updatedAdmission,
});

} catch (error) {
console.error("Update recent admission error:", error);

return res.status(500).json({
  success: false,
  message: "Unable to update the admission record.",
});

}
};

/*

PUBLISH / UNPUBLISH ADMISSION

PATCH /api/recent-admissions//publish

Body:
{
"isPublished": true
}

Publishing is an explicit admin action.

*/

export const toggleRecentAdmissionPublication = async (req, res) => {
try {
const { id } = req.params;
const { isPublished } = req.body;

if (!isValidId(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid admission record ID.",
  });
}

if (typeof isPublished !== "boolean") {
  return res.status(400).json({
    success: false,
    message: "isPublished must be true or false.",
  });
}

const admission = await RecentAdmission.findById(id).populate({
  path: "student",
  select: "_id name profileImage enrollmentStatus isActive",
});

if (!admission) {
  return res.status(404).json({
    success: false,
    message: "Admission record not found.",
  });
}

if (isPublished) {
  if (
    !admission.student ||
    !admission.student.isActive ||
    admission.student.enrollmentStatus !== "ongoing"
  ) {
    return res.status(400).json({
      success: false,
      message: "Only active, ongoing students can be published.",
    });
  }

  if (!admission.student.profileImage) {
    return res.status(400).json({
      success: false,
      message: "A profile picture is required for publication.",
    });
  }

  const displayDesignation = getDisplayDesignation(admission);

  if (displayDesignation === "Designation not specified") {
    return res.status(400).json({
      success: false,
      message: "Add a designation before publishing this admission.",
    });
  }
}

admission.isPublished = isPublished;
await admission.save();

return res.status(200).json({
  success: true,
  message: isPublished
    ? "Admission published successfully."
    : "Admission unpublished successfully.",
  admission,
});

} catch (error) {
console.error("Toggle admission publication error:", error);

return res.status(500).json({
  success: false,
  message: "Unable to update publication status.",
});

}
};

/*

DELETE ADMISSION RECORD

DELETE /api/recent-admissions/

*/

export const deleteRecentAdmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admission record ID.",
      });
    }

    const admission = await RecentAdmission.findByIdAndDelete(id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admission removed from Recent Admissions.",
    });
  } catch (error) {
    console.error("Delete recent admission error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove the admission record.",
    });
  }
};

/*

PUBLIC WEBSITE API

GET /api/recent-admissions/public

*/

export const getPublicRecentAdmissions = async (req, res) => {
try {
const admissions = await RecentAdmission.find({
isPublished: true,
})
.populate({
path: "student",
match: {
isActive: true,
enrollmentStatus: "ongoing",
},
select: "_id name profileImage",
})
.sort({ displayOrder: 1, createdAt: -1 })
.lean();

const publicAdmissions = admissions
  .filter(
    (admission) =>
      admission.student &&
      admission.student.profileImage &&
      admission.student.name,
  )
  .map((admission) => ({
    _id: admission._id,
    name: admission.student.name,
    profileImage: admission.student.profileImage,
    designation: getDisplayDesignation(admission),
    badge: "New Learner",
  }));

return res.status(200).json({
  success: true,
  admissions: publicAdmissions,
});

} catch (error) {
console.error("Get public recent admissions error:", error);

return res.status(500).json({
  success: false,
  message: "Unable to fetch recent admissions.",
});

}
};