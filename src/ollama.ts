import ollama from 'ollama'
import {Ai, AiCompleteOptions, AiResponse} from "./ai.js";


export function createOllama(): Ai {
  return {
    async complete(opts: AiCompleteOptions): Promise<AiResponse> {
      const response = await ollama.chat({
        model: opts.model,
        messages: opts.messages,
      })

      return {
        content: response.message.content,
      };
    }
  }
}