import fs from "fs";
import path from "path";
import { Stream } from "stream";
import { Storage } from "@google-cloud/storage";

interface Crowi {
  getConfig(): CrowiConfig;
  cacheDir: string;
}

interface CrowiConfig {
  crowi: {
    [key: string]: unknown;
  };
}

interface CrowiUploader {
  uploadFile(
    filePath: string,
    contentType: string,
    fileStream: Stream,
    options: unknown
  ): Promise<unknown>;
  deleteFile(fileId: string, filePath: string): Promise<void>;
  generateUrl(filePath: string): string;
  findDeliveryFile(fileId: string, filePath: string): Promise<string>;
}

export default (crowi: Crowi): CrowiUploader => {
  const storage = new Storage();
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || "crowi";
  const bucket = storage.bucket(bucketName);

  const createCacheFileName = (fileId: string): string => {
    return path.join(crowi.cacheDir, `attachment-${fileId}`);
  };

  const clearCache = (fileId: string): void => {
    const cacheFile = createCacheFileName(fileId);

    fs.unlink(cacheFile, () => {
      // ?
    });
  };

  const shouldUpdateCacheFile = (path: string): boolean => {
    try {
      const stats = fs.statSync(path);

      if (!stats.isFile()) {
        return true;
      }

      if (stats.size <= 0) {
        return true;
      }
    } catch (e) {
      // console.error(e);
      return true;
    }

    return false;
  };

  return {
    uploadFile: (filePath, _, fileStream) =>
      new Promise((resolve, reject) => {
        const file = bucket.file(filePath);
        fileStream
          .pipe(file.createWriteStream())
          .on("error", (err) => {
            reject(err);
          })
          .on("finish", async () => {
            await file.makePublic();
            resolve();
          });
      }),
    deleteFile: async (fileId, filePath) => {
      await bucket.file(filePath).delete();
      clearCache(fileId);
    },
    generateUrl: (filePath) => {
      return `https://storage.googleapis.com/${bucketName}/${filePath}`;
    },
    findDeliveryFile: async (fileId, filePath) => {
      const cacheFile = createCacheFileName(fileId);

      if (shouldUpdateCacheFile(cacheFile)) {
        await bucket.file(filePath).download({
          destination: cacheFile,
        });
      }

      return cacheFile;
    },
  };
};
