import config from '../../config/index.js';
import { t } from '../../locales/index.js';
import { ROLE_AI, ROLE_HUMAN } from '../../services/openai.js';
import { generateCompletion } from '../../utils/index.js';
import { COMMAND_BOT_CONTINUE, COMMAND_BOT_TALK } from '../commands/index.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';
import { getPrompt, setPrompt } from '../prompt/index.js';

import mebaruSystemPrompt from '../prompt/fishCharacter.js'; // 🐟 メバルくんのキャラ設定

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ FAQ静的回答を読み込む
import { getStaticFaqAnswer } from '../faq/index.js'; // ← これを追加！

// ✅ __dirnameをESMで再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ faq.txt を handlers ディレクトリからの相対パスで読み込む
const faqPath = path.resolve(__dirname, '../faq/faq.txt');
const faqText = fs.readFileSync(faqPath, 'utf-8');

/**
 * @param {Context} context
 * @returns {boolean}
 */
const check = (context) => (
  context.hasCommand(COMMAND_BOT_TALK)
  || context.hasBotName
  || context.source.bot.isActivated
);

/**
 * @param {Context} context
 * @returns {Promise<Context>}
 */
const exec = (context) => check(context) && (
  async () => {
    const userInput = context.trimmedText;

    // ✅ Step 1: 静的FAQに一致するかチェック
    const staticAnswer = getStaticFaqAnswer(userInput);
    if (staticAnswer) {
      context.pushText(staticAnswer); // ChatGPTを通さず即返信！
      return context;
    }

    // ✅ Step 2: ChatGPT用プロンプトを生成（従来どおり）
    const prompt = getPrompt(context.userId);

    prompt.write('system', `
${mebaruSystemPrompt}

以下はサービスに関するFAQです。ユーザーの質問と完全に一致しなくても、意味が近い内容があればそれを参考にして答えてください。FAQにない内容はわからないと答えても構いません。

${faqText}
    `.trim());

    prompt.write(ROLE_HUMAN, `${t('__COMPLETION_DEFAULT_AI_TONE')(config.BOT_TONE)}${userInput}`).write(ROLE_AI);

    try {
      const { text, isFinishReasonStop } = await generateCompletion({ prompt });
      prompt.patch(text);
      setPrompt(context.userId, prompt);
      updateHistory(context.id, (history) => history.write(config.BOT_NAME, text));
      const actions = isFinishReasonStop ? [] : [COMMAND_BOT_CONTINUE];
      context.pushText(text, actions);
    } catch (err) {
      context.pushError(err);
    }

    return context;
  }
)();

export default exec;
