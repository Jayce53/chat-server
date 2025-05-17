import fs from "fs/promises";
import * as fsSync from "fs";
import path from "path";

export class StorageLocal implements StorageInterface {

  private _containerName : string = "";

  constructor(senderId : number) {
    this._containerName = `/uploads/${senderId?.toString().padStart(7, "0")}`;
    console.log(this._containerName);
    fsSync.mkdirSync(this._containerName, {recursive : true});
  }

  setContainerName(containerName : string) : void {
    this._containerName = containerName;
  }

  getContainerName() : string {
    return this._containerName;
  }

  save(fileName : string, buffer : Buffer) : Promise<void> {
    return fs.writeFile(path.join(this._containerName, fileName), buffer, {flag : "w"}); // Overwrite .fileName, buffer);
  }

  get(fileName : string) : Promise<Buffer> {
    return fs.readFile(path.join(this._containerName, fileName));
  }
}
