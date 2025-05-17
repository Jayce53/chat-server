import fs from "fs/promises";
import sharp, {Metadata, Sharp} from "sharp";

// Configuration FIXME - get from config file
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

// Types for clarity
interface StorageInterface {
  save(fileName : string, buffer : Buffer) : Promise<void>;
}

// Simple local file system store (for demonstration)
const localStore : StorageInterface = {
  save(fileName : string, buffer : Buffer) : Promise<void> {
    return fs.writeFile(fileName, buffer);
  },
};

/**
 * Process and store image in multiple formats
 * @param originalImage
 * @param originalMeta
 * @param orignalExt
 * @param fileName - Base filename for storing images
 * @param store - Storage interface for saving files
 */
async function processImage(
  originalImage : Sharp,
  originalMeta: Metadata,
  orignalExt: string,
  fileName : string,
  store : StorageInterface = localStore,
) : Promise<any> {
  try {
    // Get image metadata first

    // Only resize if image exceeds max dimensions
    let processedBuffer : Buffer;
    if ((originalMeta.width && originalMeta.width > MAX_WIDTH) ||
      (originalMeta.height && originalMeta.height > MAX_HEIGHT)) {
      processedBuffer = await originalImage
        .resize({
          width              : MAX_WIDTH,
          height             : MAX_HEIGHT,
          fit                : "inside",
          withoutEnlargement : true,
        })
        .toBuffer();
    } else {
      processedBuffer = await originalImage.toBuffer();
    }


    // Parallel processing of different formats
    const savePromises = [
      {ext : "jpg", convert : ()  => sharp(processedBuffer).jpeg().toBuffer()},
      {ext : "webp", convert : () => sharp(processedBuffer).webp().toBuffer()},
      {ext : "avif", convert : () => sharp(processedBuffer).avif().toBuffer()},
    ].map(async ({ext, convert}) => {
      const outputFileName = `${fileName}.${ext}`;

      // Parallel conversion without awaiting
      const convertPromise:Promise<any> = convert();

      // Non-blocking save with the result of conversion
      return convertPromise
        .then((convertedBuffer: Buffer) => {
          let  finalBuffer;
          if (ext === orignalExt) {
            finalBuffer = convertedBuffer.length <= processedBuffer.length
              ? convertedBuffer
              : processedBuffer;
          } else {
            finalBuffer = convertedBuffer;
          }

          return store.save(outputFileName, finalBuffer);
        });
    });

    // Wait for all saves to complete
    return Promise.all(savePromises);
  } catch (error) {
    console.error("Image processing failed:", error);
    throw error;
  }
}

export {processImage, localStore};
