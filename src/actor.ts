export interface Actor {
  phases: Record<string, ActorPhase>
  startPhase: string;
}

export interface ActorPhase {
  model: string;
  script: string
  next_steps?: {
    model: string;
    decisions: ActorPhaseNextStep[];
  }
}

export interface ActorPhaseNextStep {
  question: string
  next: string;
}