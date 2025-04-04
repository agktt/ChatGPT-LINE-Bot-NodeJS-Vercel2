import config from '../config/index.js';
import { MOCK_TEXT_OK } from '../constants/mock.js';
import {
  createChatCompletion, createTextCompletion, FINISH_REASON_STOP, MODEL_GPT_3_5_TURBO,
} from '../services/openai.js';

class Completion {
  text;

  finishReason;

  constructor({
    text,
    finishReason,
  }) {
    this.text = text;
    this.finishReason = finishReason;
  }

  get isFinishReasonStop() {
    return this.finishReason === FINISH_REASON_STOP;
  }
}

/**
 * @param {Object} param
 * @param {Prompt} param.prompt
 * @returns {Promise<Completion>}
 */
const generateCompletion = async ({
  prompt,
}) => {
  // 開発環境ではモックテキストを返す
  if (config.APP_ENV !== 'production') return new Completion({ text: MOCK_TEXT_OK });

  // プロンプトに日本語で応答するように追加
  prompt.write(ROLE_AI, '必ず日本語で返答してください。');

  // GPT-3.5 Turbo モデルを使用する場合
  if (config.OPENAI_COMPLETION_MODEL.includes(MODEL_GPT_3_5_TURBO)) {
    const { data } = await createChatCompletion({ messages: prompt.messages });
    const [choice] = data.choices;
    return new Completion({
      text: choice.message.content.trim(),  // 応答のテキストを取得
      finishReason: choice.finish_reason,    // 終了理由を取得
    });
  }

  // 他のモデルの場合
  const { data } = await createTextCompletion({ prompt: prompt.toString() });
  const [choice] = data.choices;
  return new Completion({
    text: choice.text.trim(),  // 応答のテキストを取得
    finishReason: choice.finish_reason,    // 終了理由を取得
  });
};

export default generateCompletion;
