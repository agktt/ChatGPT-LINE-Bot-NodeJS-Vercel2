import { middleware, Client } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';

// LINE bot 設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

// ChatGPT 設定
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// LINE クライアント
const client = new Client(config);

// Vercel API設定（Body Parser無効化）
export const configApi = {
  api: {
    bodyParser: false,
  },
};

// ミドルウェア
const lineMiddleware = middleware(config);

// Vercel対応 handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // LINE署名検証
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

            // ChatGPTへ送信
            const completion = await openai.createChatCompletion({
              model: 'gpt-3.5-turbo',
              messages: [{ role: 'user', content: userMessage }],
            });

            const gptReply = completion.data.choices[0].message.content;

            // LINEへ返信
            await client.replyMessage(event.replyToken, {
              type: 'text',
              text: gptReply,
            });
          }
        })
      );

      res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });
}
