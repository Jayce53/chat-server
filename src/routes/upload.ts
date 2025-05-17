/**
 * This is the upload route (/api/upload) handler
 *
 * This gets the file data using Formidable
 * An obfuscated filename is generated from the user ID and the cardinality of the user's uploaded files
 * All a user's uploaded files are stored in a subdirectory of the upload directory the same the zero padded user ID
 */
import {Application, Request, Response} from "express";
import {Fields, Files, IncomingForm, VolatileFile} from "formidable";
import {getTokenPayload} from "@/token";
import hashBlur from "@/utility/URLHashBlur";
import {PassThrough, type Writable} from "stream";
import sharp from "sharp";
import uploadFiles, {FileDetail} from "@/classes/UploadFiles";
import {processImage} from "@/utility/processImage";
import {StorageLocal} from "@/classes/StorageLocal";

// noinspection JSUnusedGlobalSymbols
export function routeSetup(app : Application) : void {
  console.log("setup route: /api/upload");
  app.post("/api/upload", (req : Request, res : Response) => {

    console.log("/api/upload");
    /**
     * The token is in the cookie for non-test clients or in the x-token header for test clients
     * We may have a token in cookies for a test client but it may not be valid for this request
     * So get the token from the headers there's one there and ignore the cookie token
     */
    const token = req.headers["x-token"] ||req.cookies.token;
    const senderId = getTokenPayload(token)?._id;
    if (!senderId) {
      console.log("No sender ID");
      res.status(401).json({error : "You must be logged in to upload files."});
      // FIXME Loging?
      return;
    }

    console.log(`Sender ID: ${senderId}`);
    const originalImage = sharp();

    const imageStream = (file? : VolatileFile) : Writable => {

      const pass = new PassThrough();

      console.log(file?.originalFilename);
      pass.pipe(originalImage);
      return pass;
    };

    const form = new IncomingForm({
      keepExtensions         : true,
      multiples              : false,
      fileWriteStreamHandler : imageStream,
    });

    form.parse(req, async (err : any, fields : Fields, files : Files) : Promise<void> => {

      if (err || !files || !files.file) {
        console.error("Error parsing the files:", err);
        res.status(500).json({error : "A parsing error occurred during the upload."});
        return;
      }

      console.log(files);
      console.log(fields);

      const metadata = await originalImage.metadata();
      console.log(metadata);

      /**
       * Create a storage class
       */
      const storage = new StorageLocal(senderId);
      /**
       * Generate a base file name from the user ID and the number of files he's already uploaded
       * We add 1 then tweak it a bit so it's not so obvious (even when it's obfuscated) that it's a sequence number
       */
      let fileCount : number = uploadFiles.count(senderId) + 1;
      fileCount = fileCount * 1000 + fileCount; // Otherwise even the obfuscated fileName becomes somewhat predictable
      const baseFileName = `${hashBlur.encode(senderId, fileCount)}`;
      console.log(`fileName: ${baseFileName}`);

      const type = files.file[0].mimetype?.split("/").pop();
      const originalExt = type === "jpeg" ? "jpg" : type!;
      await Promise.all([
        storage.save(`${baseFileName}-orig.${originalExt}`, await originalImage.keepExif().toBuffer()),
        processImage(originalImage, metadata, originalExt, baseFileName, storage),
      ]);
      const detail : FileDetail = {
        md5              : fields.md5![0],
        filename         : baseFileName,
        originalFilename : files.file[0].originalFilename!,
        height           : metadata.height!,
        width            : metadata.width!,
        mimetype         : files.file[0].mimetype!,
      };
      /**
       * Sending the return before we update the image DB  is not technically correct
       * We should really wait for addUpload() to complete before sending the response
       * But sending the response first means the user gets a response quicker and addUupload()
       * should complete quick enough so as not to make any difference to anyone
       */
      const resp = await uploadFiles.addUpload(senderId, detail); // FIXME try.. catch
      console.log(`resp: ${JSON.stringify(resp)}`);
      res.status(200).send(baseFileName);
    });
  });
}
