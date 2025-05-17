const Module = require("module");
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  // Your custom resolution logic here
  // For example, modifying the request path
  console.log(request);
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
