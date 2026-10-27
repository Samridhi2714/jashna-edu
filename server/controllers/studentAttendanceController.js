import Attendance from "../models/Attendance.js";
import Student from "../models/Student.js";

const calculateAttendanceStats = (records) => {
  let present = 0;
  let absent = 0;
  let publicHoliday = 0;
  let jashnaLeave = 0;

  records.forEach((record) => {
    switch (record.status) {
      case "present":
        present++;
        break;

      case "absent":
        absent++;
        break;

      case "public_holiday":
        publicHoliday++;
        break;

      case "jashna_leave":
        jashnaLeave++;
        break;

      default:
        break;
    }
  });

  const countedClasses = present + absent;

  const percentage =
    countedClasses === 0
      ? 0
      : Number(((present / countedClasses) * 100).toFixed(1));

  return {
    present,
    absent,
    publicHoliday,
    jashnaLeave,
    countedClasses,
    percentage,
  };
};

export const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.student.id).select(
      "name username batch isActive"
    );

    if (!student) {
      return res.status(404).json({
        message: "Student account not found",
      });
    }

    if (!student.isActive) {
      return res.status(403).json({
        message: "This student account is inactive",
      });
    }

    const attendance = await Attendance.find({
      student: student._id,
    })
      .sort({
        date: -1,
      })
      .lean();

    const stats = calculateAttendanceStats(attendance);

    res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        username: student.username,
        batch: student.batch,
      },
      attendance,
      stats,
    });
  } catch (error) {
    console.error("Get student attendance error:", error);

    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
};