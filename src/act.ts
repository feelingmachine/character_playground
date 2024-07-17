import {Actor, ActorPhase} from "./actor.js";
import {Ai} from "./ai.js";
import {logger} from "./logger.js";

export interface Act {
  messages: ActMessage[]
  activePhase: ActorPhase
  phases: Record<string, ActorPhase>
  ended: boolean
}

export interface ActMessage {
  content: string
  role: 'assistant' | 'user'
}

export function createAct(actor: Actor): Readonly<Act> {
  const activePhase = actor.phases[actor.startPhase]

  if (!activePhase) {
    throw new Error('invalid actor start phase, does not exists')
  }

  return {
    messages: [],
    phases: actor.phases,
    activePhase,
    ended: false,
  }
}

export interface ActResponse {
  act: Act
  response: string;
}

const actLogger = logger;

export async function resolveResponse(act: Readonly<Act>, ai: Ai): Promise<Readonly<ActResponse>> {

  actLogger.info(`resolve ai response for script: ${act.activePhase.script}`)
  const completion = await ai.complete({
    model: act.activePhase.model,
    messages: [
      {role: 'system', content: act.activePhase.script},
      ...act.messages,
    ],
  })

  const response = completion.content ?? 'Ups, etwas lief schief';

  for (const line of response.split('\n').filter(s => !!s)) {
    console.log(line);
  }

  return {
    act: {
      ...act,
      messages: [
        ...act.messages,
        {role: 'assistant', content: response}
      ]
    },
    response,
  }
}

async function getNextPhase(act: Act, ai: Ai): Promise<ActorPhase | null> {
  if (!act.activePhase.next_steps || act.activePhase.next_steps.decisions.length === 0) {
    return null;
  }

  const systemPrompt = 'Based on the following chat:' +
    '\n\n' +
    act.messages.map(m => `${m.role}: ${m.content.replace(/\n\n/g, '').replace(/\n/g, ' ')}`).join('\n') +
    '\n\n' +
    act.activePhase.next_steps.decisions.map(s => `if the following question is fullfilled then reply with \"${s.next}\": Question: ${s.question}\n`)

  const completion = await ai.complete({
    model: act.activePhase.next_steps.model,
    messages: [
      {role: 'system', content: systemPrompt}
    ],
  })

  actLogger.info(`next phase response: ${completion.content}`);

  const nextPhase = act.activePhase.next_steps.decisions.find(s => s.next === completion.content)
  if (nextPhase) {
    actLogger.info(`go to next phase: ${completion.content}`);
    return act.phases[nextPhase.next] ?? null;
  } else {
    return null;
  }
}

export async function appendUserReply(act: Readonly<Act>, reply: string, ai: Ai): Promise<Readonly<Act>> {
  const newAct: Act = {
    ...act,
    messages:  [
      ...act.messages,
      {role: 'user', content: reply}
    ]
  }

  const nextPhase = await getNextPhase(newAct, ai)

  return {
    ...newAct,
    activePhase: nextPhase ?? act.activePhase,
  }
}