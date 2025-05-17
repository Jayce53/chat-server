/**
 * This represents the UploadFiles document
 */
import {db} from "@/classes/Database";

export type FileDetail = {
  md5 : string;
  filename : string;
  originalFilename : string;
  width : number;
  height : number;
  mimetype : string;
};

export interface UploadFiles {
  _id : number;
  filesDetail : FileDetail[];
}

const uploadedFiles : Map<number, UploadFiles> = new Map();

function addUpload(userId : number, detail : FileDetail) {
  const uploads : UploadFiles = uploadedFiles.get(userId) || {_id : userId, filesDetail : []};
  uploads.filesDetail.push(detail);
  uploadedFiles.set(userId, uploads);
  const {md5, ...data} = detail;
  return db.insertOne("images", {_id : `${userId}-${md5}`, ...data});
}

function count(userId : number) : number {
  return uploadedFiles.get(userId)?.filesDetail.length || 0;
}
// noinspection JSUnusedGlobalSymbols
function removeUser(userId : number) {
  uploadedFiles.delete(userId);
}

export default {
  addUpload,
  count,
  removeUser,
};
