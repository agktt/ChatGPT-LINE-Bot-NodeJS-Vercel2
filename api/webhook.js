export default async function handler(req, res) {
  if (req.method === "POST") {
    res.status(200).send("Webhook OK (仮テスト)");
  } else {
    res.status(405).send("Method Not Allowed");
  }
}
