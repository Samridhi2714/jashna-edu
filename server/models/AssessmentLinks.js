import mongoose from "mongoose";

const assessmentSetSchema = new mongoose.Schema(
{
setNumber: {
type: Number,
required: true,
min: 1,
max: 6,
},

title: {
  type: String,
  required: true,
  trim: true,
},

link: {
  type: String,
  default: "",
  trim: true,
},

},
{ _id: false }
);

const assessmentLinksSchema = new mongoose.Schema(
{
assessmentType: {
type: String,
required: true,
enum: ["general-english", "business-english"],
unique: true,
},

title: {
  type: String,
  required: true,
},

sets: {
  type: [assessmentSetSchema],
  validate: {
    validator(sets) {
      return (
        Array.isArray(sets) &&
        sets.length === 6 &&
        new Set(sets.map((item) => item.setNumber)).size === 6 &&
        sets.every(
          (item) =>
            Number.isInteger(item.setNumber) &&
            item.setNumber >= 1 &&
            item.setNumber <= 6
        )
      );
    },
    message: "Each assessment must contain exactly six unique test sets.",
  },
},

},
{ timestamps: true }
);

const AssessmentLinks = mongoose.model(
"AssessmentLinks",
assessmentLinksSchema
);

export default AssessmentLinks;
