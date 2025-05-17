import {Plugin} from "vite";
import path from "path";

export function resolver(): Plugin {
  return {
    name : "custom-resolver",
    resolveId(importee, importer) {
      console.log(`importee: ${importee}, importer: ${importer}`);
      // Check if the importee is a relative path without extension
      if (!importee.endsWith(".js") && !importee.endsWith(".ts") && !importee.startsWith("/") && !importee.startsWith(".") && importer!.includes("src")) {
        const p = "G:/chat/server/" + importee + ".ts";
        console.log(`p: ${p}`);
        const resolvedPath = path.resolve(p);
        console.log(`Resolved path: ${resolvedPath}`);
        return resolvedPath;
      }
      return null; // Return null to fallback to default resolver
    }
  };
}
