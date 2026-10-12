// A teaching model, not an authorisation service or an AgentTool protocol.
// Every action and actor here is synthetic. No tools, I/O, timers or persistence.
export function initialFlow() {
  return { state: 'idle', authorised: false, uses: 0, ticks: 0, expiresAt: null,
    maker: null, reviewer: null, events: [], message: 'An open door. No task has been offered.' };
}
const terminal = new Set(['declined', 'resting', 'withdrawn', 'expired', 'stopped', 'closed']);
export function transition(before, action, actor = 'maker') {
  if (action === 'reset') return initialFlow();
  const next = { ...before, events: [...before.events] };
  const say = message => {
    next.message = message;
    next.events = [...next.events, { action, state: next.state, message }].slice(-16);
    return next;
  };
  if (terminal.has(next.state)) return say('This turn is finished. A new turn needs an explicit reset.');
  if (action === 'tick') {
    next.ticks += 1;
    if (['offered', 'accepted', 'running'].includes(next.state) && next.ticks >= next.expiresAt) {
      next.state = 'expired'; next.authorised = false;
      return say('The finite window ended. Nothing renews itself.');
    }
    return say('The example clock advanced by one step.');
  }
  if (['offered', 'accepted', 'running'].includes(next.state) && next.ticks >= next.expiresAt) {
    next.state = 'expired'; next.authorised = false;
    return say('The finite window ended. Nothing renews itself.');
  }
  switch (action) {
    case 'offer':
      if (next.state !== 'idle') return say('There is already a turn here.');
      next.state = 'offered'; next.expiresAt = next.ticks + 3;
      return say('Offer: make one synthetic drawing, within three clock steps. No dispatch.');
    case 'accept':
      if (next.state !== 'offered') return say('Acceptance needs an open offer.');
      next.state = 'accepted';
      return say('The fictional recipient accepted. Host authority is still separate.');
    case 'decline':
      if (next.state !== 'offered') return say('Decline answers an open offer.');
      next.state = 'declined'; next.authorised = false;
      return say('Declined. Welcome remains; no explanation, penalty or retry.');
    case 'rest':
      if (!['idle', 'offered', 'accepted'].includes(next.state)) return say('Use stop to end an active act.');
      next.state = 'resting'; next.authorised = false;
      return say('Rest is a complete outcome. There is no next job waiting here.');
    case 'authorise':
      if (next.state !== 'accepted') return say('This example waits for acceptance before a scoped host decision.');
      next.authorised = true;
      return say('Synthetic host scope: one drawing, one use. This grants no real-world authority.');
    case 'start':
      if (next.state !== 'accepted' || !next.authorised || next.uses !== 0)
        return say('Not started: acceptance, explicit host scope and an unused budget are all required.');
      next.state = 'running'; next.uses += 1; next.maker = actor;
      return say('One act is represented in the rehearsal. No agent or process was launched.');
    case 'report':
      if (next.state !== 'running') return say('There is no active act to report.');
      next.state = 'reported'; next.authorised = false;
      return say('A result was reported, not accepted. Another seat must examine it.');
    case 'review':
      if (next.state !== 'reported') return say('Review needs a reported result.');
      if (actor === next.maker) return say('Self-review refused. The maker cannot supply the independent seat.');
      next.state = 'reviewed'; next.reviewer = actor;
      return say('A different synthetic seat reviewed the result. Distinct labels are not authenticated people.');
    case 'close':
      if (next.state !== 'reviewed') return say('This example closes after review, or you can stop it now.');
      next.state = 'closed'; next.authorised = false;
      return say('The turn is closed. Keep only the context you choose; no automatic continuation.');
    case 'stop':
      next.state = next.state === 'running' ? 'stopped' : 'withdrawn'; next.authorised = false;
      return say('Stopped here. This cannot undo an effect that already happened.');
    default: return say('Unknown action. Nothing started.');
  }
}
export function seats(subjects, rotation = 0) {
  if (!Number.isFinite(rotation)) throw new TypeError('rotation must be finite');
  return subjects.map((subject, index) => {
    const angle = (index / subjects.length) * Math.PI * 2 - Math.PI / 2 + rotation * Math.PI / 180;
    return { ...subject, x: 310 + Math.cos(angle) * 208, y: 290 + Math.sin(angle) * 202 };
  });
}
export function describeBearing(value) { return value.replace(/^reported_/, '').replaceAll('_', ' '); }
