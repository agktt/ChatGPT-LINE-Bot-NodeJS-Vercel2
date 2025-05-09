import { middleware, Client, validateSignature } from '@line/bot-sdk';
import { Configuration, OpenAIApi } from 'openai';
import getRawBody from 'raw-body';

// LINE bot 設定（名前を lineConfig に変更）
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new Client(lineConfig);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

// Vercel API 設定（configという名前でOK）
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const rawBody = await getRawBody(req, { encoding: true });
  const signature = req.headers['x-line-signature'];

  if (!validateSignature(rawBody, lineConfig.channelSecret, signature)) {
    return res.status(401).send('Unauthorized');
  }

  const body = JSON.parse(rawBody);
  const events = body.events;

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

          const gptReply = completion.data.choices[0].message.content;

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: gptReply,
          });
        }
      })
    );

    res.status(200).send('OK');
  } catch (err) {
    console.error('エラー内容:', err);
    res.status(500).send('Internal Server Error');
  }
}
