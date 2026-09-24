import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventNumber: {
      type: Number,
      unique: true,
      sparse: true,
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    datePrecision: {
      type: String,
      enum: ["exact", "month", "year"],
      default: "exact",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },

    category: {
      type: String,
      trim: true,
      default: "Event",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;