import { fn } from "./bar";

const ctx: Worker = self as any;

ctx.addEventListener("message", event => {
  const message = `another worked-${event.data + fn()}`;
  ctx.postMessage(message);
});

console.log("another.worker BroadcastChannel", typeof BroadcastChannel);
