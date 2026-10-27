import "dotenv/config";

import {
  getOrCreateFolder,
  uploadBuffer,
  getFileStream,
  deleteFile,
} from "./services/driveService.js";

async function testDriveFileOperations() {
  let uploadedFileId = null;

  try {
    console.log("Preparing file operations test...");

    // 1. Get the Task-Submissions folder.
    const folderId = await getOrCreateFolder(
      "Task-Submissions",
      process.env.GOOGLE_DRIVE_FOLDER_ID
    );

    // 2. Upload a small test file.
    const originalContent =
      "Jashna Edu LMS - File download verification test.";

    const uploadedFile = await uploadBuffer({
      buffer: Buffer.from(originalContent),
      fileName: `file-operations-test-${Date.now()}.txt`,
      mimeType: "text/plain",
      folderId,
    });

    if (!uploadedFile?.id) {
      throw new Error("Uploaded file ID was not returned.");
    }

    uploadedFileId = uploadedFile.id;

    console.log("Upload successful.");
    console.log("File ID:", uploadedFileId);

    // 3. Retrieve the file as a stream.
    console.log("\nTesting file retrieval...");

    const response = await getFileStream(uploadedFileId);
    const chunks = [];

    for await (const chunk of response.data) {
      chunks.push(
        Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      );
    }

    const downloadedContent = Buffer.concat(chunks).toString("utf8");

    if (downloadedContent !== originalContent) {
      throw new Error("Downloaded content does not match the original.");
    }

    console.log("PASS: File retrieved successfully.");
    console.log("PASS: Downloaded content matches the original.");

    // 4. Delete only the test file created by this script.
    console.log("\nTesting deletion...");

    await deleteFile(uploadedFileId);

    console.log("PASS: Test file deleted successfully.");

    uploadedFileId = null;

  } catch (error) {
    console.error("\nFile operations test failed.");

    if (error.response?.data) {
      console.error(
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error(error.message);
    }

    process.exitCode = 1;

  } finally {
    // Clean up only the test file created by this script,
    // if it still exists after an unsuccessful test.
    if (uploadedFileId) {
      try {
        await deleteFile(uploadedFileId);
        console.log("Temporary test file cleaned up.");
      } catch (cleanupError) {
        console.error(
          "Could not clean up the temporary test file:",
          cleanupError.message
        );
      }
    }
  }
}

await testDriveFileOperations();