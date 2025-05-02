import { handleEvents } from "../app/index.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await handleEvents(req.body.events);
      res.status(200).send("OK");
    } catch (err) {
      console.error("Error handling events:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
