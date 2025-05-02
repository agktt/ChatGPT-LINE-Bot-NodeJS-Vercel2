import { handleEvents, printPrompts } from "../app/index.js";
import config from "../config/index.js";
import storage from "../storage/index.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await storage.initialize();
      await handleEvents(req.body.events);
      res.status(200).send("OK");

      if (config.APP_DEBUG) printPrompts();
    } catch (err) {
      console.error("Error handling events:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
