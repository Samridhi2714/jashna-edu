import "dotenv/config";
import { google } from "googleapis";
import { Readable } from "node:stream";

async function testGoogleDrive() {
  try {
    // 1. Validate required environment variables
    const requiredVariables = [
      "GOOGLE_DRIVE_CLIENT_ID",
      "GOOGLE_DRIVE_CLIENT_SECRET",
      "GOOGLE_DRIVE_REDIRECT_URI",
      "GOOGLE_DRIVE_REFRESH_TOKEN",
      "GOOGLE_DRIVE_FOLDER_ID",
    ];

    const missingVariables = requiredVariables.filter(
      (variable) => !process.env[variable]
    );

    if (missingVariables.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVariables.join(", ")}`
      );
    }

    // 2. Configure Google OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    const tokenInfo = await oauth2Client.getTokenInfo(
  (await oauth2Client.getAccessToken()).token
);

console.log("Granted OAuth scopes:", tokenInfo.scopes);

    // 3. Initialize Google Drive API
    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    // DIAGNOSTIC 1: Identify the authenticated Google account
const accountResponse = await drive.about.get({
  fields: "user(emailAddress,displayName)",
});

console.log(
  "Authenticated Google account:",
  accountResponse.data.user?.emailAddress
);

// DIAGNOSTIC 2: Search for the folder by its name
const folderSearch = await drive.files.list({
  q: "name = 'Jashna Edu Student Submission' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
  spaces: "drive",
  fields: "files(id, name, mimeType)",
  pageSize: 100,
});

console.log(
  "Matching folders found:",
  folderSearch.data.files?.length ?? 0
);

for (const folder of folderSearch.data.files ?? []) {
  console.log("Folder name:", folder.name);
  console.log("Folder ID:", folder.id);
}

    // 4. Verify access to the destination folder
    console.log("Checking Google Drive folder...");

    const folderResponse = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: "id, name, mimeType",
    });

    const folder = folderResponse.data;

    if (folder.mimeType !== "application/vnd.google-apps.folder") {
      throw new Error(
        "The configured Google Drive ID does not identify a folder."
      );
    }

    console.log(`Folder verified: ${folder.name}`);

    // 5. Upload a test file
    console.log("Uploading hello.txt...");

    const fileResponse = await drive.files.create({
      requestBody: {
        name: "hello.txt",
        mimeType: "text/plain",
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
      },

      media: {
        mimeType: "text/plain",
        body: Readable.from(
          "Hello from Jashna Edu LMS!\nGoogle Drive integration test successful."
        ),
      },

      fields: "id, name, mimeType, webViewLink",
    });

    console.log("\nSUCCESS! Google Drive upload completed.");
    console.log("File name:", fileResponse.data.name);
    console.log("File ID:", fileResponse.data.id);
    console.log("File link:", fileResponse.data.webViewLink);
  } catch (error) {
    console.error("\nGoogle Drive test failed.");

    if (error.response?.data) {
      console.error(
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error(error.message);
    }

    process.exitCode = 1;
  }
}

testGoogleDrive();