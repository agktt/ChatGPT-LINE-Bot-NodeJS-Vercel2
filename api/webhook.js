import { middleware, Client } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

export const configApi = {
  api: {
    bodyParser: false,
  },
};

export default middleware(config);

export const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send('No Events');
  }

  try {
    await Promise.all(
      events.map(async (event) => {
        if (event.type === 'message' && event.message.type === 'text') {
          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `受け取りました: ${event.message.text}`,
          });
        }
      })
    );
    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
