function main(i) {
  // converts touch and mouse events into pointer events
  // if browser does not support it
  i = pointerEvents(i);
  // converts pointer events on `dragstart`, `dragging` and `drop`
  i = makeDragMessages(i);
  // converts pointer events into `select`, `selecting` and `selected` messages
  i = makeSelectMessages(i);
  // higlights selected elements
  i = selectMark(i);
  // if user drags some selected item same message is duplicated for
  // all other selected items
  i = propagateSelection(i);
  // creates new element if user starts dragging from palette area
  i = byElement(palette, i);
  // adds counter number to each new element
  i = addCounter(i);
  // moves dragging element to top
  i = setZIndex(i);
  i = layoutSource(i);
  i = byElement(function(i) {
    // gets current velocity on drop
    // and injects a few more drags to continue movement
    i = inertiaStart(i);
    // assigns `over` field in each message
    // if its `element` is over ".target" DOM element
    i = assignOver(i);
    // stops elements moving by inertia
    // if it is over some ".inertia-intercept"
    i = inertiaIntercept(i);
    // generates "remove" message for elements dropped
    // over ".trash" element
    i = trash(i);
    // sets `intersect` property into an message if its
    // element boundaries intersect some other ".draggable" element
    i = setIntersectProperty(i);
    // checks if user dropped an item exactly on some ".target"
    // otherwise generates "dragcancel" message
    i = validateDrop(i);
    // animated return to original "dragstart" position on "dragcancel"
    i = flyBack(i);
    // animates drop on list element
    i = animateIntersectDrop(i);
    // highlight position to drop the items in lists
    i = highlightIntersectDrag(i);
    // animation for "remove" message
    i = animRemove(i);
    // if canceled drag started not for palette
    // simulates drop to original location
    i = undoCancel(i);
    // moves element into a list ".target" children on drop from "body"
    i = layoutTarget(i);
    // converts "dragcancel" to "remove"
    i = removeCancelled(i);
    // handles "remove" by removing the element from DOM
    i = applyRemove(i);
    // updates current element absolute position
    i = setPosition(i);
    return i;
  }, i);
  return i;
}

const POINTER_EVENTS = typeof PointerEvent !== "undefined";

const pointerEvents = POINTER_EVENTS
  ? v => v
  : async function* mouseToPointer(input) {
      let last;
      for await (const i of input) {
        switch (i.type) {
          case "mousemove":
          case "mouseup":
          case "mousedown":
            yield {
              type: `pointer${i.type.substr(5)}`,
              target: i.target,
              x: i.clientX,
              y: i.clientY,
              preventDefault: () => i.preventDefault(),
            };
            break;
          case "touchmove":
          case "touchstart":
            if (i.targetTouches.length !== 1) break;
            last = i;
          case "touchend":
          case "touchcancel":
            const t = last.targetTouches[0];
            yield {
              type:
                i.type === "touchstart"
                  ? "pointerdown"
                  : i.type === "touchmove"
                    ? "pointermove"
                    : "pointerup",
              target: i.target,
              x: t && t.clientX,
              y: t && t.clientY,
              preventDefault: () => i.preventDefault(),
            };
            break;
        }
      }
    };

async function* makeDragMessages(input) {
  const source = share(input);
  for await (const i of source) {
    if (i.type === "pointerdown") {
      const element = i.target.closest(".draggable");
      if (element) {
        i.preventDefault();
        yield { type: "dragstart", element, x: i.x, y: i.y, event: i };
        for await (const j of source) {
          if (j.type === "pointerup" || j.type === "pointermove") {
            j.preventDefault();
            const dragging = j.type === "pointermove";
            yield {
              type: dragging ? "dragging" : "drop",
              element,
              x: j.x,
              y: j.y,
              event: j,
            };
            if (!dragging) break;
          }
          yield j;
        }
        continue;
      }
    }
    yield i;
  }
}

async function* palette(input) {
  const source = share(input);
  for await (const i of source) {
    if (i.type === "dragstart" && i.element.closest(".palette")) {
      const box = i.element.getBoundingClientRect();
      const element = i.element.cloneNode(true);
      element.style.left = `${box.x + window.pageXOffset}px`;
      element.style.top = `${box.y + window.pageYOffset}px`;
      document.body.appendChild(element);
      yield { ...i, element };
      for await (const j of source) {
        if (j.element === i.element) {
          yield { ...j, element };
          if (j.type === "drop") break;
        } else yield j;
      }
    } else yield i;
  }
}

async function* setZIndex(input) {
  let z = 0;
  for await (const i of input) {
    if (i.type === "dragstart") i.element.style.zIndex = ++z;
    yield i;
  }
}

async function* addCounter(input) {
  let cnt = 0;
  for await (const i of input) {
    if (i.type === "dragstart") {
      if (!i.element.firstChild.classList.contains("id")) {
        const num = document.createElement("span");
        i.element.insertBefore(num, i.element.firstChild);
        num.outerHTML = `<span class="id">${++cnt}</span>`;
      }
    }
    yield i;
  }
}

async function* assignOver(input) {
  function over(element) {
    const box = element.getBoundingClientRect();
    for (const target of document.getElementsByClassName("target")) {
      const targetBox = target.getBoundingClientRect();
      if (
        targetBox.top < box.top &&
        targetBox.left < box.left &&
        targetBox.bottom > box.bottom &&
        targetBox.right > box.right
      )
        return target;
    }
    return null;
  }
  for await (const i of input)
    yield i.element ? { ...i, over: over(i.element) } : i;
}

async function* trash(input) {
  for await (const i of input) {
    if (i.type === "drop" && i.over && i.over.closest(".trash"))
      yield { ...i, type: "remove" };
    else yield i;
  }
}

async function* animRemove(input) {
  for await (const i of input) {
    if (i.type === "remove") {
      const el = i.element;
      const box = el.getBoundingClientRect();
      for await (const j of anim()) {
        el.style.width = `${box.width * (1 - j)}px`;
        el.style.height = `${box.height * (1 - j)}px`;
        el.style.top = `${box.y + window.pageYOffset + (box.height * j) / 2}px`;
        el.style.left = `${box.x + window.pageXOffset + (box.width * j) / 2}px`;
      }
    }
    yield i;
  }
}

async function* undoCancel(input) {
  let startOver;
  for await (const i of input) {
    if (i.type === "dragstart") {
      startOver = i.over;
    } else if (i.type === "dragcancel") {
      if (startOver) {
        yield { ...i, type: "drop" };
        continue;
      }
    }
    yield i;
  }
}

async function* removeCancelled(input) {
  for await (const i of input) {
    if (i.type === "dragcancel") yield { ...i, type: "remove" };
    else yield i;
  }
}

async function* validateDrop(input) {
  for await (const i of input) {
    if (i.type === "drop") {
      if (!i.over) {
        yield { ...i, type: "dragcancel" };
        continue;
      }
    }
    yield i;
  }
}

async function* applyRemove(input) {
  for await (const i of input) {
    if (i.type === "remove") {
      if (i.element.parentNode) i.element.parentNode.removeChild(i.element);
      yield { ...i, type: "drop" };
    } else yield i;
  }
}

async function* setPosition(input) {
  const source = share(input);
  for await (const i of source) {
    yield i;
    if (i.type === "dragstart") {
      const { element } = i;
      const box = element.getBoundingClientRect();
      const x = box.x + window.pageXOffset;
      const y = box.y + window.pageYOffset;
      for await (const j of source) {
        yield j;
        if (j.type === "drop") break;
        if (j.type === "dragging") {
          element.style.left = `${x + j.x - i.x}px`;
          element.style.top = `${y + j.y - i.y}px`;
        }
      }
    }
  }
}

async function* filterUseless(input) {
  for await (const i of input) {
    switch (i.type) {
      case "dragstart":
      case "dragging":
      case "drop":
        yield i;
    }
  }
}

async function* layoutSource(input) {
  for await (const i of input) {
    let target;
    if (i.type === "dragstart" && (target = i.element.closest(".list"))) {
      const el = i.element;
      const box = el.getBoundingClientRect();
      const dummy = document.createElement("div");
      dummy.classList.add("dummy");
      dummy.style.width = `${box.width}px`;
      dummy.style.height = `${box.height}px`;
      el.parentNode.insertBefore(dummy, el);
      el.parentNode.removeChild(el);
      el.style.left = `${box.left + window.pageXOffset}px`;
      el.style.top = `${box.top + window.pageYOffset}px`;
      document.body.appendChild(el);
      yield { ...i, over: target };
      yield { type: "remove", element: dummy };
      continue;
    }
    yield i;
  }
}

async function* layoutTarget(input) {
  const source = share(input);
  for await (const i of source) {
    let target;
    if (i.type === "drop" && i.over && i.over.classList.contains("list"))
      i.over.insertBefore(
        i.element,
        i.intersect && i.intersect.parentNode === i.over ? i.intersect : null,
      );
    yield i;
  }
}

async function* flyBack(input) {
  let start;
  for await (const i of input) {
    switch (i.type) {
      case "dragstart":
        start = i;
        break;
      case "dragcancel":
        if (!start) break;
        for await (const j of anim())
          yield {
            ...i,
            type: "dragging",
            x: i.x + j * (start.x - i.x),
            y: i.y + j * (start.y - i.y),
          };
        yield { ...i, type: "dragcancel", over: start.over };
    }
    yield i;
  }
}

const byElement = (transducer, input) =>
  threadBy(i => i.element, i => stopThread(transducer(i)), input);

async function* stopThread(input) {
  for await (const i of input) {
    yield i;
    if (i.type === "drop") break;
  }
}

async function* threadBy(select, transducer, input) {
  const threads = new Map();
  const iter = (async function* source() {
    for await (const i of input) {
      const key = select(i);
      if (!key) {
        yield i;
        continue;
      }
      let thread = threads.get(key);
      if (!thread) {
        const q = [];
        let cont;
        const iter = transducer(
          (async function*() {
            for (;;) {
              while (q.length) yield q.shift();
              await new Promise(k => (cont = k));
              cont = null;
            }
          })(),
        )[Symbol.asyncIterator]();
        thread = {
          iter,
          task: iter.next(),
          key,
          send(i) {
            q.push(i);
            if (cont) cont();
          },
        };
        threads.set(key, thread);
        yield false;
      }
      thread.send(i);
      continue;
    }
  })()[Symbol.asyncIterator]();
  const main = { iter, task: iter.next() };
  for (;;) {
    const i = await Promise.race(
      [main, ...threads.values()].map(i =>
        i.task.then(
          ({ done, value }) => ((i.value = value), (i.done = done), i),
        ),
      ),
    );
    if (i.done) {
      if (i === main) return i.value;
      threads.delete(i.key);
      continue;
    }
    i.task = i.iter.next();
    if (i.value) yield i.value;
  }
}

async function* animateIntersectDrop(input) {
  for await (const i of input) {
    if (i.over && i.over.classList.contains("list")) {
      if (i.type === "drop") {
        const dummy = document.createElement("div");
        i.over.insertBefore(dummy, i.intersect);
        const box = i.element.getBoundingClientRect();
        for await (const j of anim()) {
          const dummyBox = dummy.getBoundingClientRect();
          dummy.style.height = `${j * box.height}px`;
          i.element.style.left = `${box.x +
            window.pageXOffset +
            j * (dummyBox.x - box.x)}px`;
          i.element.style.top = `${box.y +
            window.pageYOffset +
            j * (dummyBox.y - box.y)}px`;
        }
        i.over.removeChild(dummy);
      }
    }
    yield i;
  }
}

async function* highlightIntersectDrag(input) {
  let dummy, last;
  for await (const i of input) {
    if (
      i.type === "dragging" &&
      i.over &&
      i.intersect &&
      i.intersect.parentNode === i.over
    ) {
      if (last !== i.intersect) {
        last = i.intersect;
        if (!dummy) {
          dummy = document.getElementById("poshl");
          if (!dummy) {
            dummy = document.createElement("div");
            dummy.id = "poshl";
          }
        }
        i.over.insertBefore(dummy, i.intersect);
        dummy.style.height = "10px";
      }
    } else if (dummy) {
      if (dummy.parentNode) dummy.parentNode.removeChild(dummy);
      dummy = null;
      last = null;
    }
    yield i;
  }
}

async function* setIntersectProperty(input) {
  for await (const i of input) {
    let el;
    if (i.y && i.element && i.over && i.over.classList.contains("list")) {
      const children = [...i.over.childNodes]
        .filter(i => i.classList && i.classList.contains("draggable"))
        .map(i => ({ el: i, box: i.getBoundingClientRect() }))
        .sort((a, b) => a.box.top - a.box.top);
      const x = children.findIndex(j => j.box.top + j.box.height / 2 > i.y);
      yield { ...i, intersect: x === -1 ? null : children[x].el || null };
    } else yield i;
  }
}

async function* selectMark(input) {
  let selectMark;
  for await (const i of input) {
    yield i;
    switch (i.type) {
      case "select":
      case "selecting":
        if (i.type === "select" && selectMark) {
          selectMark.style.display = "none";
        } else {
          if (!selectMark) {
            selectMark = document.createElement("div");
            selectMark.classList.add("selection");
            document.body.appendChild(selectMark);
          }
          selectMark.style.top = `${i.top + window.pageYOffset}px`;
          selectMark.style.left = `${i.left + window.pageXOffset}px`;
          selectMark.style.width = `${i.width}px`;
          selectMark.style.height = `${i.height}px`;
          selectMark.style.display = "block";
        }
        const items = document.getElementsByClassName("draggable");
        for (const item of items) {
          const itemBox = item.getBoundingClientRect();
          item.classList.toggle(
            "selected",
            itemBox.top > i.top &&
              itemBox.left > i.left &&
              itemBox.bottom < i.bottom &&
              itemBox.right < i.right,
          );
        }
        break;
    }
  }
}

async function* makeSelectMessages(input) {
  const source = share(input);
  for await (const i of source) {
    yield i;
    if (i.type === "pointerdown") {
      i.preventDefault();
      yield { type: "selectstart", x: i.x, y: i.y };
      for await (const j of source) {
        yield j;
        if (j.type === "pointerup" || j.type === "pointermove") {
          j.preventDefault();
          yield {
            type: j.type === "pointerup" ? "select" : "selecting",
            left: Math.min(i.x, j.x),
            top: Math.min(i.y, j.y),
            right: Math.max(i.x, j.x),
            bottom: Math.max(i.y, j.y),
            width: Math.abs(i.x - j.x),
            height: Math.abs(i.y - j.y),
          };
          if (j.type === "pointerup") break;
        }
      }
    }
  }
}

async function* propagateSelection(input) {
  for await (const i of input) {
    if (i.element && i.element.classList.contains("selected")) {
      for (const j of [...document.getElementsByClassName("selected")])
        yield { ...i, element: j };
    } else yield i;
  }
}

async function* inertiaStart(input) {
  let vx = 0,
    vy = 0,
    last;
  for await (const i of input) {
    if (i.element && i.element.classList.contains("inert")) {
      i.time = performance.now();
      if (i.type === "drop") {
        if (vx || vy) {
          const v = Math.sqrt(vx * vx + vy * vy);
          if (v > 0.00001) {
            let x = i.x,
              y = i.y;
            const acc = 0.01,
              maxAcc = 0.009;
            let ax = (vx * acc) / v,
              ay = (vy * acc) / v;
            if (Math.abs(ax) > maxAcc) ax = Math.sign(ax) * maxAcc;
            if (Math.abs(ay) > maxAcc) ay = Math.sign(ay) * maxAcc;
            let t = i.time;
            for (;;) {
              const ct = await new Promise(window.requestAnimationFrame);
              const dt = ct - t;
              t = ct;
              x += vx * dt;
              y += vy * dt;
              const nvx = vx - ax * dt,
                nvy = vy - ay * dt;
              vx = Math.sign(vx) === Math.sign(nvx) ? nvx : 0;
              vy = Math.sign(vy) === Math.sign(nvy) ? nvy : 0;
              yield { ...i, type: "dragging", x, y, kind: "inertia" };
              if (vx === 0 && vy === 0) break;
            }
          }
        }
        last = null;
        vx = vy = 0;
      } else if (i.type === "dragging") {
        if (last) {
          const dt = i.time - last.time;
          vx = (i.x - last.x) / dt;
          vy = (i.y - last.y) / dt;
        }
        last = i;
      } else {
        last = null;
        vx = vy = 0;
      }
    }
    yield i;
  }
}

async function* inertiaIntercept(input) {
  const source = share(input);
  for await (const i of source) {
    if (
      i.type === "dragging" &&
      i.kind === "inertia" &&
      i.over &&
      i.over.classList.contains("inertia-intercept")
    ) {
      yield { ...i, type: "drop" };
      return;
    }
    yield i;
  }
}

async function* anim(delay = 100) {
  const start = performance.now();
  const stop = start + delay;
  const step = 1 / delay;
  for (
    let cur;
    (cur = await new Promise(window.requestAnimationFrame)) <= stop;

  )
    yield step * (cur - start);
}

let callback;
const queue = [];
function send(event) {
  if (!queue.length && callback) callback();
  queue.push(event);
}

async function* produce() {
  for (;;) {
    while (queue.length) yield queue.shift();
    await new Promise(i => (callback = i));
  }
}

async function consume(input) {
  for await (const i of input) {
  }
}

if (POINTER_EVENTS) {
  document.addEventListener("pointermove", send, false);
  document.addEventListener("pointerdown", send, false);
  document.addEventListener("pointerup", send, false);
} else {
  document.addEventListener("mousemove", send, false);
  document.addEventListener("mousedown", send, false);
  document.addEventListener("mouseup", send, false);
  document.addEventListener("touchstart", send, false);
  document.addEventListener("touchend", send, false);
  document.addEventListener("touchcancel", send, false);
  document.addEventListener("touchmove", send, false);
}

function share(iterable) {
  const iterator = iterable[Symbol.asyncIterator]();
  return {
    next(value) {
      return iterator.next();
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

consume(main(produce()));
