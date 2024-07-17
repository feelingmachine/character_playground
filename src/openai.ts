import {OpenAI} from "openai";
import {Ai, AiCompleteOptions, AiResponse} from "./ai.js";

export function createOpenAI(): Ai {
  const openai = new OpenAI({
    apiKey: process.env.OPENAPI_KEY,
  })

  return {
    async complete(opts: AiCompleteOptions): Promise<AiResponse> {
      const completion = await openai.chat.completions.create({
        model: opts.model,
        messages: opts.messages,
      })

      return {
        content: completion.choices[0]?.message?.content ?? null,
      }
    }
  }
}