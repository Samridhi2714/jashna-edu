import mongoose from "mongoose";

const instituteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "main",
      immutable: true,
    },

    instituteName: {
      type: String,
      required: true,
      trim: true,
      default: "Jashna Edu",
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: "info@jashnaedu.com",
    },

    contactNumber: {
      type: String,
      required: true,
      trim: true,
      default: "+91 99530 09947",
    },

    whatsappNumber: {
      type: String,
      trim: true,
      default: "+91 99530 09947",
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "https://www.jashnaedu.com/",
    },

    address: {
      type: String,
      required: true,
      trim: true,
      default:
        "Jashna Edu, Block D, New Industrial Tw 2, New Industrial Township, Faridabad, Haryana 121001, India",
    },

    footerDescription: {
      type: String,
      trim: true,
      default:
        "Empowering english language learners with communication skills and confidence.",
    },
  },
  {
    timestamps: true,
  }
);

const InstituteSettings = mongoose.model(
  "InstituteSettings",
  instituteSettingsSchema
);

export default InstituteSettings;