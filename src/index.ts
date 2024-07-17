import actorRole from './actor_role.json'
import {createInterface} from "node:readline";
import {appendUserReply, createAct, resolveResponse} from "./act.js";
import 'dotenv/config'
import {createAi} from "./ai.js";

const ai = createAi();

let act = createAct(actorRole);

do {
  const result = await resolveResponse(act, ai);

  act = result.act

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userReply = await new Promise<string>(resolve => {
    readline.question("Reply: ", (answer) => resolve(answer))
  })

  readline.close()

  act = await appendUserReply(act, userReply, ai)
} while (!act.ended);