import { middleware } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const lineMiddleware = middleware(config);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  return new Promise((resolve, reject) => {
    lineMiddleware(req, res, () => {
      console.log('署名検証成功');
      res.status(200).send('OK');
      resolve();
    });
  });
}
