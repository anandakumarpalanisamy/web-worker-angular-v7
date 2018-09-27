import { fn } from "./foo";

const ctx: Worker = self as any;

ctx.addEventListener("message", event => {
  const message = `worked-${event.data + fn()}`;
  ctx.postMessage(message);
});

console.log("main.worker BroadcastChannel", typeof BroadcastChannel);
