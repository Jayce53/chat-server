import express, {Application} from "express";
import cors from "cors";
// import session from "express-session";
import cookieParser from "cookie-parser";

console.log("appSetup.ts");

// let sessionMiddleware: any;

function setupApp(): Application {
  console.log("setupApp");
  const app = express();
  app.set("trust proxy", 1);

  /**
   * FIXME - This liberal setting of cors is a big security risk!!!!
   * Testing only!!!
   */
  app.use("/api", cors({
    origin      : (origin, callback) => {
      callback(null, origin);
    },
    credentials : true,
//  exposedHeaders : ["X-Powered-By", "Server", "Date", "Set-Cookie"],
  }));

  app.use(express.json({limit : "500kb"}));

  app.use(cookieParser());

  // sessionMiddleware = session({
  //   secret            : "Glass House Mountains",
  //   resave            : true,
  //   saveUninitialized : true,
  //   cookie            : {
  //     secure   : true,
  //     sameSite : "none"
  //   }
  // });
//  app.use(sessionMiddleware);
  return app;
}

export {setupApp};
