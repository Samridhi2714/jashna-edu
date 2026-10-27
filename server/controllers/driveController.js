import {
  getDriveAccountInfo,
  getRootFolderInfo,
} from "../services/driveService.js";

export const getDriveStatus = async (req, res) => {
  try {
    // Check the authenticated Google account and configured root folder.
    const [account, rootFolder] = await Promise.all([
      getDriveAccountInfo(),
      getRootFolderInfo(),
    ]);

    return res.status(200).json({
      success: true,
      connected: true,
      account: {
        email: account?.emailAddress || null,
        displayName: account?.displayName || null,
      },
      rootFolder: {
        id: rootFolder.id,
        name: rootFolder.name,
        accessible: true,
      },
      purpose: "Student task submission storage",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Keep credentials, tokens, and detailed provider errors out of the response.
    console.error("Google Drive status check failed:", error.message);

    return res.status(503).json({
      success: false,
      connected: false,
      account: null,
      rootFolder: {
        name: null,
        accessible: false,
      },
      purpose: "Student task submission storage",
      checkedAt: new Date().toISOString(),
      message:
        "Google Drive could not be verified. Please check the server configuration and connection.",
    });
  }
};
