import { ChatStreamPayload, ModelProvider, OpenAIChatMessage } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

// TODO: 临时写法，后续要重构成 model card 展示配置
export const reasoningModels = new Set([
  'o1-preview',
  'o1-preview-2024-09-12',
  'o1-mini',
  'o1-mini-2024-09-12',
  'o1',
  'o1-2024-12-17',
  'o3-mini',
  'o3-mini-2025-01-31',
]);

export const pruneReasoningPayload = (payload: ChatStreamPayload) => ({
  ...payload,
  frequency_penalty: 0,
  messages: payload.messages.map((message: OpenAIChatMessage) => ({
    ...message,
    role: message.role === 'system' ? 'developer' : message.role,
  })),
  presence_penalty: 0,
  temperature: 1,
  top_p: 1,
});

export const LobeOpenAI = LobeOpenAICompatibleFactory({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { model } = payload;

      if (reasoningModels.has(model)) {
        return pruneReasoningPayload(payload) as any;
      }

      return { ...payload, stream: payload.stream ?? true };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.OpenAI,
});
