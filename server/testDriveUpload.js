import "dotenv/config";

import {
  getOrCreateFolder,
  uploadBuffer,
} from "./services/driveService.js";

async function testDriveUpload() {
  try {
    console.log("Preparing Google Drive upload test...");

    // 1. Get or create the Task-Submissions folder.
    const taskFolderId = await getOrCreateFolder(
      "Task-Submissions",
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    console.log("Task folder ready.");

    // 2. Prepare a small test file.
    const fileContent = Buffer.from(
      "Jashna Edu LMS\nGoogle Drive upload service test successful."
    );

    // 3. Upload the file.
    const uploadedFile = await uploadBuffer({
      buffer: fileContent,
      fileName: `drive-service-test-${Date.now()}.txt`,
      mimeType: "text/plain",
      folderId: taskFolderId,
    });

    // 4. Validate the response.
    if (!uploadedFile?.id) {
      throw new Error(
        "Upload completed without returning a valid file ID."
      );
    }

    console.log("\nSUCCESS: File uploaded to Google Drive.");
    console.log("File name:", uploadedFile.name);
    console.log("File ID:", uploadedFile.id);
    console.log("MIME type:", uploadedFile.mimeType);
    console.log("File size:", uploadedFile.size);
    console.log("Web view link:", uploadedFile.webViewLink);

  } catch (error) {
    console.error("\nGoogle Drive upload test failed.");

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

await testDriveUpload();