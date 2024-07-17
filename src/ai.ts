import {createOllama} from "./ollama.js";
import {createOpenAI} from "./openai.js";

export interface Ai {
  complete(opts: AiCompleteOptions): Promise<AiResponse>
}

export interface AiResponse {
  content: string | null;
}

export interface AiCompleteOptions {
  model: string
  messages: AiMessage[];
}

export interface AiMessage {
  role: 'assistant' | 'user' | 'system'
  content: string;
}

export function createAi(): Ai {
  const interfaces = {
    'ollama/': createOllama(),
    'openai/': createOpenAI(),
  } as const;

  return {
    complete(opts: AiCompleteOptions): Promise<AiResponse> {
      for(const [prefix, ai] of Object.entries(interfaces)) {
        if (opts.model.startsWith(prefix)) {
          return ai.complete({
            model: opts.model.substring(prefix.length),
            messages: opts.messages,
          })
        }
      }

      throw new Error(`invalid model ${opts.model}`)
    }
  }
}