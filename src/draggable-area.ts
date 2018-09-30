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
  const makeDragMessages = async function*(input) {
    const source = asyncGenThingy.share(input);
    for await (const clicked of source) {
      if (clicked.type !== "pointerdown") {
        continue;
      }
      const element = clicked.target.closest(".draggable");
      if (!element) {
        continue;
      }
      clicked.preventDefault();
      const parentBox = element
        .closest(".draggable-area")
        .getBoundingClientRect();
      const start_element_box = element.getBoundingClientRect();
      let dragDistance = false;
      for await (const dragged of source) {
        if (dragged.type !== "pointerup" && dragged.type !== "pointermove") {
          continue;
        }
        dragged.preventDefault();
        if (dragged.type === "pointerup") {
          if (dragDistance) {
            yield {
              type: "drop",
            };
            dragDistance = false;
          }
          break;
        }
        if (dragged.type === "pointermove") {
          yield {
            type: "dragstart",
            element,
          };
          dragDistance = true;
          const delta_x = dragged.x - clicked.x;
          const delta_y = dragged.y - clicked.y;
          const new_x = Math.min(
            parentBox.width - start_element_box.width,
            Math.max(0, start_element_box.left - parentBox.left + delta_x),
          );
          const new_y = Math.min(
            parentBox.height - start_element_box.height,
            Math.max(0, start_element_box.top - parentBox.top + delta_y),
          );
          yield {
            type: "dragging",
            new_x,
            new_y,
          };
        }
      }
    }
  };
  const setPosition = async function*(input) {
    const area = document.querySelector(".draggable-area");
    const source = asyncGenThingy.share(input);
    for await (const dragStarted of source) {
      console.assert(dragStarted.type === "dragstart");
      const { element } = dragStarted;
      console.log("dragstart", element.innerHTML);
      area.classList.add("draggable-area--dragging");
      element.classList.add("draggable--dragging");
      for await (const dragged of source) {
        if (dragged.type === "dragging") {
          const { new_x, new_y } = dragged;
          element.style.left = `${new_x}px`;
          element.style.top = `${new_y}px`;
        }
        if (dragged.type === "drop") {
          console.log("drop", element.innerHTML);
          area.classList.remove("draggable-area--dragging");
          element.classList.remove("draggable--dragging");
          break;
        }
      }
    }
  };
  const throttleMove = async function*(input) {
    const source = asyncGenThingy.share(input);
    let last = new Date().valueOf();
    for await (const i of source) {
      if (i.type !== "pointermove") {
        yield i;
      } else if (new Date().valueOf() - last > 32) {
        last = new Date().valueOf();
        yield i;
      }
    }
  };
  function main(i) {
    // i = throttleMove(i);
    // converts pointer events on `dragstart`, `dragging` and `drop`
    i = makeDragMessages(i);
    // updates current element absolute position
    i = setPosition(i);
    return i;
  }
  return Object.assign(Object.create(null), {
    send: asyncGenThingy.send,
    start() {
      const source = asyncGenThingy.share(asyncGenThingy.produce());
      const processed = main(source);
      asyncGenThingy.consume(processed);
    },
  });
};
