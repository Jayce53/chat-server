import {Application, Request, Response} from "express";
import URLHashBlur from "@/utility/URLHashBlur";
import {StorageLocal} from "@/classes/StorageLocal";
// FIXME - get size and mimetype from someplace
export function routeSetup(app : Application) : void {
  console.log("setup route: /api/locality/:coCode");
  app.get("/images/:imageName", (req : Request, res : Response) : void => {
    console.log(`get "/images/${req.params.imageName}"`);
    const path = req.params.imageName.split(".");
    const {ID0} = URLHashBlur.decode(path[0]);
    const storage = new StorageLocal(ID0);

    storage.get(req.params.imageName)
      .then((buffer) => {
        res.set("Content-Type", `image/${path[1]}`);
        res.set("Content-Length", buffer.length.toString());
        res.send(buffer);
    })
      .catch((error) => {
        console.error("Database read error:", error);
        res.status(500).send("Internal Server Error");
      });
  });
}
