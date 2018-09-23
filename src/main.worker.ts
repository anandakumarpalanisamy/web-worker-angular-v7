import { fn } from "./foo";

console.log("main.worker BroadcastChannel", typeof BroadcastChannel);

const ctx: Worker = self as any;

ctx.addEventListener("message", event => {
  console.log(`worker got message: ${event.data}`);
  console.log("fns", fn());
  const message = `worked-${event.data + fn()}`;
  ctx.postMessage(message);
});
