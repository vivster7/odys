import express from "express";
import http from "http";

const router = express.Router();

router.all("/api/*", async (req, res) => {
  // Check if there are any query arguments in the URL for PATCH and DELETE.
  if (["PATCH", "DELETE"].includes(req.method)) {
    if (Object.keys(req.query).length === 0) {
      return res
        .status(405)
        .send(
          "Method Not Allowed: PATCH and DELETE methods require query arguments."
        );
    }
  }

  // Remove the /api/ segment from the original URL
  const path = req.originalUrl.replace(/^\/api/, "");

  // Define the destination server
  const options = {
    host: "0.0.0.0",
    port: 3001,
    path: path,
    method: req.method,
    headers: req.headers,
  };

  // Make the request to the destination server
  const proxyReq = http.request(options, (proxyRes) => {
    res.set(proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error(err);
  });

  // TODO: Stop deserializing + serializing body.
  proxyReq.write(JSON.stringify(req.body));

  proxyReq.end();
});

module.exports = router;
