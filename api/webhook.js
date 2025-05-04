import { middleware, Client } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';

// LINE設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(config);

// OpenAI設定
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// VercelのAPI設定（BodyParserを無効化）
export const config = {
  api: {
    bodyParser: false,
  },
};

// ミドルウェア
const lineMiddleware = middleware(config);

// Webhook本体
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  lineMiddleware(req, res, async () => {
    const events = req.body.events;
    if (!events || events.length === 0) {
      return res.status(200).send('No Events');
    }

    try {
      await Promise.all(
        events.map(async (event) => {
          if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;

            const completion = await openai.createChatCompletion({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: userMessage }],
            });

            const replyText = completion.data.choices[0].message.content;

            await client.replyMessage(event.replyToken, {
              type: 'text',
              text: replyText,
            });
          }
        })
      );
      res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
}
