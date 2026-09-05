import type { Handler } from "@netlify/functions";
import serverless from "serverless-http";
import app from "../../src/app";

// serverless-http's Lambda-handler type doesn't line up exactly with
// @netlify/functions' Handler type, even though both wrap the same
// underlying AWS Lambda signature Netlify Functions actually run on.
const wrapped = serverless(app, {
  // Netlify/API Gateway base64-encodes the body for these content types before
  // it reaches us; without this, multipart file uploads (media upload) arrive
  // corrupted because Express/Multer would otherwise receive raw base64 text
  // instead of the decoded binary buffer.
  binary: ["multipart/form-data"],
});

export const handler = wrapped as unknown as Handler;
