// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json()); // for JSON body
app.use(express.urlencoded({ extended: true })); // for form data

// Optional: Limit which hosts can be targeted
const ALLOWED_DOMAINS = ["example.com", "jsonplaceholder.typicode.com"];

app.all("/forward", async (req, res) => {
  const target = req.query.target;

  if (!target) {
    return res.status(400).json({ error: "Missing target parameter" });
  }

  try {
    const url = new URL(target);

    // Optional domain safety check
    if (!ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain))) {
      return res.status(403).json({ error: "Target not allowed" });
    }

    const options = {
      method: req.method,
      headers: { ...req.headers, host: url.hostname },
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      options.body = JSON.stringify(req.body);
      options.headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, options);
    const body = await response.text();

    res.status(response.status).send(body);
  } catch (err) {
    console.error("Error forwarding:", err);
    res.status(500).json({ error: "Failed to forward request" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Forwarder running on port ${PORT}`));
