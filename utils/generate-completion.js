import config from '../config/index.js';
import { MOCK_TEXT_OK } from '../constants/mock.js';
import {
  createChatCompletion,
  createTextCompletion,
  FINISH_REASON_STOP,
  MODEL_GPT_3_5_TURBO,
  ROLE_SYSTEM, // 追加！
} from '../services/openai.js';

class Completion {
  text;
  finishReason;

  constructor({ text, finishReason }) {
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
const generateCompletion = async ({ prompt }) => {
  if (config.APP_ENV !== 'production') return new Completion({ text: MOCK_TEXT_OK });

  if (config.OPENAI_COMPLETION_MODEL.includes(MODEL_GPT_3_5_TURBO)) {
    // 👇 system prompt を追加！
    const messagesWithSystem = [
      { role: ROLE_SYSTEM, content: config.APP_INIT_PROMPT },
      ...prompt.messages,
    ];

    const { data } = await createChatCompletion({ messages: messagesWithSystem });
    const [choice] = data.choices;

    return new Completion({
      text: choice.message.content.trim(),
      finishReason: choice.finish_reason,
    });
  }

  const { data } = await createTextCompletion({ prompt: prompt.toString() });
  const [choice] = data.choices;

  return new Completion({
    text: choice.text.trim(),
    finishReason: choice.finish_reason,
  });
};

export default generateCompletion;
