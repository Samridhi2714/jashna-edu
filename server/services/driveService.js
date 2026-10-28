import "dotenv/config";
import { google } from "googleapis";
import { Readable } from "node:stream";

const REQUIRED_ENV_VARIABLES = [
  "GOOGLE_DRIVE_CLIENT_ID",
  "GOOGLE_DRIVE_CLIENT_SECRET",
  "GOOGLE_DRIVE_REDIRECT_URI",
  "GOOGLE_DRIVE_REFRESH_TOKEN",
  "GOOGLE_DRIVE_FOLDER_ID",
];

const GOOGLE_FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

let driveClient = null;
let rootFolderId = null;

function getDriveClient() {
  if (driveClient) {
    return driveClient;
  }

  const missingVariables = REQUIRED_ENV_VARIABLES.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Google Drive is not configured. Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
  });

  driveClient = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  return driveClient;
}

// Escape special characters used in Google Drive query strings.
function escapeDriveQueryValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

const getUniqueFileName = async (fileName, folderId) => {
  const drive = getDriveClient();
  const trimmedName = fileName.trim();
  const lastDotIndex = trimmedName.lastIndexOf(".");

  const hasExtension =
    lastDotIndex > 0 && lastDotIndex < trimmedName.length - 1;

  const baseName = hasExtension
    ? trimmedName.slice(0, lastDotIndex)
    : trimmedName;

  const extension = hasExtension
    ? trimmedName.slice(lastDotIndex)
    : "";

  let candidateName = trimmedName;
  let counter = 2;

  while (true) {
    const escapedName = escapeDriveQueryValue(candidateName);

    const response = await drive.files.list({
      q: [
        `name = '${escapedName}'`,
        `'${folderId}' in parents`,
        "trashed = false",
      ].join(" and "),
      spaces: "drive",
      pageSize: 1,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const existingFiles = response.data.files ?? [];

    if (existingFiles.length === 0) {
      return candidateName;
    }

    candidateName = `${baseName}-${counter}${extension}`;
    counter += 1;
  }
};

/**
 * Verify access to a Google Drive folder.
 */
async function verifyFolderAccess(folderId) {
  const drive = getDriveClient();

  if (!folderId || typeof folderId !== "string") {
    throw new Error("A valid Google Drive folder ID is required.");
  }

  const response = await drive.files.get({
    fileId: folderId,
    fields: "id, name, mimeType, trashed",
    supportsAllDrives: true,
  });

  const folder = response.data;

  if (
    folder.mimeType !== GOOGLE_FOLDER_MIME_TYPE ||
    folder.trashed
  ) {
    throw new Error(
      "The configured Google Drive ID is not an accessible folder."
    );
  }

  return folder;
}

/**
 * Find an existing folder inside a parent folder.
 * Create it if it does not exist.
 *
 * Returns the folder ID.
 */
export async function getOrCreateFolder(
  name,
  parentId
) {
  const drive = getDriveClient();
  const effectiveParentId = parentId || rootFolderId;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("A valid folder name is required.");
  }

  const parentFolder = await verifyFolderAccess(
    effectiveParentId
  );

  const folderName = name.trim();
  const escapedName = escapeDriveQueryValue(folderName);

  const query = [
    `name = '${escapedName}'`,
    `'${parentFolder.id}' in parents`,
    `mimeType = '${GOOGLE_FOLDER_MIME_TYPE}'`,
    "trashed = false",
  ].join(" and ");

  const response = await drive.files.list({
    q: query,
    spaces: "drive",
    pageSize: 100,
    fields: "files(id, name, mimeType, parents)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  const folders = response.data.files ?? [];

  if (folders.length > 0) {
    return folders[0].id;
  }

  const createdFolder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: GOOGLE_FOLDER_MIME_TYPE,
      parents: [parentFolder.id],
    },
    fields: "id, name, mimeType, parents",
    supportsAllDrives: true,
  });

  if (!createdFolder.data.id) {
    throw new Error("Google Drive did not return the new folder ID.");
  }

  return createdFolder.data.id;
}

/**
 * Upload a Buffer to Google Drive.
 *
 * Returns file metadata.
 */
export async function uploadBuffer({
  buffer,
  fileName,
  mimeType,
  folderId,
}) {
  const drive = getDriveClient();
  const effectiveFolderId = folderId || rootFolderId;

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error("A non-empty file buffer is required.");
  }

  if (
    !fileName ||
    typeof fileName !== "string" ||
    !fileName.trim()
  ) {
    throw new Error("A valid file name is required.");
  }

  if (!mimeType || typeof mimeType !== "string") {
    throw new Error("A valid MIME type is required.");
  }

  await verifyFolderAccess(effectiveFolderId);

  const uniqueFileName = await getUniqueFileName(
    fileName,
    effectiveFolderId
  );

  const response = await drive.files.create({
    requestBody: {
      name: uniqueFileName,
      parents: [effectiveFolderId],
    },

    media: {
      mimeType,
      body: Readable.from(buffer),
    },

    fields: "id, name, mimeType, size, webViewLink, parents",
    supportsAllDrives: true,
  });

  return response.data;
}

/**
 * Retrieve a Google Drive file as a readable stream.
 */
export async function getFileStream(fileId) {
  const drive = getDriveClient();

  if (!fileId || typeof fileId !== "string") {
    throw new Error("A valid Google Drive file ID is required.");
  }

  return drive.files.get(
    {
      fileId,
      alt: "media",
      supportsAllDrives: true,
    },
    {
      responseType: "stream",
    }
  );
}

/**
 * Delete a Google Drive file.
 */
export async function deleteFile(fileId) {
  const drive = getDriveClient();

  if (!fileId || typeof fileId !== "string") {
    throw new Error("A valid Google Drive file ID is required.");
  }

  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });

  return {
    success: true,
    fileId,
  };
}

/**
 * Return information about the authenticated Google account.
 */
export async function getDriveAccountInfo() {
  const drive = getDriveClient();

  const response = await drive.about.get({
    fields: "user(emailAddress,displayName)",
  });

  return response.data.user;
}

/**
 * Return information about the configured root folder.
 */
export async function getRootFolderInfo() {
  return verifyFolderAccess(rootFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID);
}