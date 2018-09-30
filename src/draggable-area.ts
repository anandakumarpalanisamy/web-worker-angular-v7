import { IterableQueue } from "./iterable-queue";

export const AsyncGenThingy = () => {
  // https://medium.com/dailyjs/decoupling-business-logic-using-async-generators-cc257f80ab33
  let callback;
  const queue = IterableQueue();
  const share = iterable => {
    const iterator = iterable[Symbol.asyncIterator]();
    return Object.assign(Object.create(null), {
      next: () => iterator.next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    });
  };
  const send = event => {
    if (!queue.length() && callback) {
      callback();
    }
    queue.add(event);
  };
  const produce = async function*() {
    for (;;) {
      while (queue.length()) {
        const value = queue.remove();
        yield value;
      }
      await new Promise(i => (callback = i));
    }
  };
  const consume = async input => {
    for await (const i of input) {
    }
  };
  return Object.assign(Object.create(null), {
    share,
    send,
    produce,
    consume,
  });
};

export const DraggableArea = () => {
  const asyncGenThingy = AsyncGenThingy();
  const main = async function*(source) {
    let dragDistance = false;
    for await (const i of source) {
      if (i.type === "pointerdown") {
        console.log("drag start?");
        const element = i.target.closest(".draggable");
        if (element) {
          const parentBox = element
            .closest(".draggable-area")
            .getBoundingClientRect();
          const childBox = element.getBoundingClientRect();
          for await (const j of source) {
            if (j.type === "pointerup") {
              if (dragDistance) {
                console.log("drag stop");
                dragDistance = false;
              }
              break;
            }
            if (j.type === "pointermove") {
              const delta_x = j.x - i.x;
              const delta_y = j.y - i.y;
              const new_x = Math.min(
                parentBox.width - childBox.width,
                Math.max(0, childBox.left - parentBox.left + delta_x),
              );
              const new_y = Math.min(
                parentBox.height - childBox.height,
                Math.max(0, childBox.top - parentBox.top + delta_y),
              );
              element.style.left = `${new_x}px`;
              element.style.top = `${new_y}px`;
              dragDistance = true;
            }
            yield j;
          }
        }
      }
      yield i;
    }
  };
  return Object.assign(Object.create(null), {
    send: asyncGenThingy.send,
    start() {
      const source = asyncGenThingy.share(asyncGenThingy.produce());
      asyncGenThingy.consume(main(source));
    },
  });
};
