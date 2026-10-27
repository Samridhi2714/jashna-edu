import InstituteSettings from "../models/InstituteSettings.js";

const DEFAULT_SETTINGS = {
  key: "main",
  instituteName: "Jashna Edu",
  contactEmail: "info@jashnaedu.com",
  contactNumber: "+91 99530 06751",
  whatsappNumber: "+91 99530 06751",
  websiteUrl: "https://www.jashnaedu.com/",
  address:
    "Jashna Edu, Block D, New Industrial Tw 2, New Industrial Township, Faridabad, Haryana 121001, India",
  footerDescription:
    "Empowering english language learners with communication skills and confidence.",
};

const PUBLIC_FIELDS = [
  "instituteName",
  "contactEmail",
  "contactNumber",
  "whatsappNumber",
  "websiteUrl",
  "address",
  "footerDescription",
];

const getSettingsDocument = async () => {
  return InstituteSettings.findOneAndUpdate(
    { key: "main" },
    {
      $setOnInsert: DEFAULT_SETTINGS,
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

const pickPublicSettings = (settings) => {
  const result = {};

  for (const field of PUBLIC_FIELDS) {
    result[field] = settings[field];
  }

  return result;
};

/*
=========================================================
PUBLIC WEBSITE SETTINGS
GET /api/settings/public

No authentication required.
Returns only public institute information.
=========================================================
*/

export const getPublicInstituteSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();

    return res.status(200).json({
      success: true,
      settings: pickPublicSettings(settings),
    });
  } catch (error) {
    console.error("Public institute settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load institute settings.",
    });
  }
};

/*
=========================================================
ADMIN SETTINGS
GET /api/settings

Requires admin authentication.
=========================================================
*/

export const getAdminInstituteSettings = async (req, res) => {
  try {
    const settings = await getSettingsDocument();

    return res.status(200).json({
      success: true,
      settings: pickPublicSettings(settings),
    });
  } catch (error) {
    console.error("Admin institute settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load institute settings.",
    });
  }
};

/*
=========================================================
UPDATE ADMIN SETTINGS
PUT /api/settings

Requires admin authentication.
=========================================================
*/

export const updateInstituteSettings = async (req, res) => {
  try {
    const updates = {};

    for (const field of PUBLIC_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string.`,
          });
        }

        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid settings fields were provided.",
      });
    }

    // Required fields cannot be empty.
    const requiredFields = [
      "instituteName",
      "contactEmail",
      "contactNumber",
      "address",
    ];

    for (const field of requiredFields) {
      if (field in updates && !updates[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} cannot be empty.`,
        });
      }
    }

    // Validate email if provided.
    if (updates.contactEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(updates.contactEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid contact email address.",
        });
      }

      updates.contactEmail = updates.contactEmail.toLowerCase();
    }

    // Validate website URL if provided.
    if (updates.websiteUrl) {
      try {
        const website = new URL(updates.websiteUrl);

        if (!["http:", "https:"].includes(website.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid website URL.",
        });
      }
    }

    const settings = await getSettingsDocument();

    Object.assign(settings, updates);

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Institute settings updated successfully.",
      settings: pickPublicSettings(settings),
    });
  } catch (error) {
    console.error("Update institute settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update institute settings.",
    });
  }
};