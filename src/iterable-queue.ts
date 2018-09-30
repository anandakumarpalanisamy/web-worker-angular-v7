export const IterableQueue = (maxCapacity = 2 ** 12, minCapacity = 2 ** 4) => {
  if (minCapacity > maxCapacity) {
    throw new Error("minCapacity must not be larger than maxCapacity");
  }
  const createArray = size => Array.apply(null, Array(size));

  let values = createArray(minCapacity);
  let readPtr = 0;
  let writePtr = 0;
  let itemCount = 0;

  const done = () => readPtr === writePtr;
  const remove = () => {
    if (done()) {
      writePtr = readPtr = 0;
      return;
    }
    const value = values[readPtr];
    values[readPtr] = undefined;
    readPtr += 1;
    if (
      writePtr - readPtr >= minCapacity &&
      writePtr - readPtr < values.length / 2
    ) {
      values = values.slice(readPtr, values.length / 2 + readPtr);
      writePtr = writePtr - readPtr;
      readPtr = 0;
      console.assert(readPtr >= 0);
      console.assert(writePtr >= 0);
    }
    itemCount -= 1;
    return value;
  };
  const add = value => {
    if (writePtr + 1 > values.length) {
      if (values.length * 2 > maxCapacity) {
        console.error("queue reached max capacity");
        return;
      }
      values.push(...createArray(values.length));
    }
    values[writePtr] = value;
    writePtr += 1;
    itemCount += 1;
  };

  return Object.assign(Object.create(null), {
    // Queue
    remove,
    add,
    length: () => itemCount,
    // Iterator
    [Symbol.iterator]() {
      return this;
    },
    next() {
      const isDone = done();
      const value = remove();
      return Object.assign(Object.create(null), {
        value,
        done: isDone,
      });
    },
  });
};
