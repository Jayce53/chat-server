/**
 * This imports all the WS event handlers
 *
 * It reads all the file names in the SocketEventHandlers directory and imports them
 *
 * In the client version, we do this with import.meta.glob() but that depends on Vite, and we don't use that for the server
 */
import {readdir} from "fs/promises";
import path from "path";
import {fileURLToPath} from "url";

const thisDirectory = `${path.dirname(fileURLToPath(import.meta.url))}/SocketEventHandlers`;

export async function importHandlers(): Promise<string[]> {
  return readdir(thisDirectory)
    .then(async (dFiles) => {
      const files = dFiles.filter((file) => {
        return file.endsWith(".ts");
      });
      console.log("importing WS event handlers: ", files);

      const promises: Promise<string>[] = files.map(async (file) => {
        return import(`./SocketEventHandlers/${file}`)
          .then((mod: {[key: string]: string}) => {
            return mod.event;
          });
      });

      return Promise.all(promises)
        .catch((err) => {
          console.error(err);
          throw err;
        });
    })
    // Catch any errors that occurred during the readdir process
    .catch((err) => {
      console.error(err);
      throw err;
    });
}
