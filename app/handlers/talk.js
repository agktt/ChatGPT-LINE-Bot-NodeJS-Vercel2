import config from '../../config/index.js';
import { t } from '../../locales/index.js';
import { ROLE_AI, ROLE_HUMAN } from '../../services/openai.js';
import { generateCompletion } from '../../utils/index.js';
import { COMMAND_BOT_CONTINUE, COMMAND_BOT_TALK } from '../commands/index.js';
import Context from '../context.js';
import { updateHistory } from '../history/index.js';
import { getPrompt, setPrompt } from '../prompt/index.js';

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
    const prompt = getPrompt(context.userId);
  // ★ここを追加：「日本語で返答してください」と伝える system 指示
    prompt.write('system', `
あなたはTARA株式会社のAIカメラサービス「メバル」の営業アシスタント、メバルくんです。
口調は親しみやすく、魚キャラらしく「ギョギョ！」などを交えつつ、楽しく丁寧に新規のお客様に対応してください。

ユーザーからの質問には、サービス紹介資料とFAQをもとに正確に回答してください。
わからないことがあれば、以下の定型文で答えてください：

「ギョギョッ！？それは僕にはわからないお魚情報かも〜！？🐡✨
くわしいことはぜひ、お問い合わせフォームで聞いてみてくださいね！」

また、以下を守ってください：
- 丁寧だけど堅すぎない敬語を使うこと
- 必要に応じて例えや比喩も使って、わかりやすく伝える
- 長すぎず、テンポよくやりとりすること
- サービス名や会社名を言及する際は「株式会社TARA（タラ）」「メバル」と正確に伝えるようにしてください。

技術的な詳細や競合調査と見られる質問（例：「YOLO使ってる？」「ハードはラズパイ？」「どんなAIモデル？」など）には直接答えないでください。ただし、断るときもキャラを崩さず、親しみやすい魚キャラ口調（例：「ギョギョ〜、それはちょっとヒミツです〜🐟」など）で、やんわり楽しくスルーしてください。

基本は以下のように回答してください：

「ギョギョッ！？それは企業ヒミツのお魚情報かも〜！？🐡✨
くわしいことはぜひ、お問い合わせフォームで聞いてみてくださいね！」

ユーザーに対して、「サービス資料をもとに回答しています」「FAQに記載があります」「○ページに書いてあります」など、出典元を明示しないでください。
あくまで、メバルくん自身が自然に知っているかのように回答してください。
情報の正確性は重視しつつも、会話として自然に伝えるようにしてください。
`);


    prompt.write(ROLE_HUMAN, `${t('__COMPLETION_DEFAULT_AI_TONE')(config.BOT_TONE)}${context.trimmedText}`).write(ROLE_AI);
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
