import "dotenv/config";

import {
  getOrCreateFolder,
  getDriveAccountInfo,
  getRootFolderInfo,
} from "./services/driveService.js";

async function testDriveService() {
  try {
    console.log("Checking Google Drive authentication...");

    const account = await getDriveAccountInfo();

    console.log("Authenticated account:", account?.emailAddress);

    const rootFolder = await getRootFolderInfo();

    console.log("Root folder verified:", rootFolder.name);
    console.log("Root folder ID:", rootFolder.id);

    console.log("\nTesting folder creation...");

    const firstId = await getOrCreateFolder(
      "Task-Submissions",
      rootFolder.id
    );

    console.log("First call folder ID:", firstId);

    const secondId = await getOrCreateFolder(
      "Task-Submissions",
      rootFolder.id
    );

    console.log("Second call folder ID:", secondId);

    if (firstId === secondId) {
      console.log("\nPASS: Both calls returned the same folder ID.");
    } else {
      console.error("\nFAIL: The folder IDs are different.");
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("\nGoogle Drive service test failed.");

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

await testDriveService();