export const IterableQueue = (maxCapacity = 2 ** 12, minCapacity = 2 ** 4) => {
  if (minCapacity > maxCapacity) {
    throw new Error("minCapacity must not be larger than maxCapacity");
  }
  const createArray = size => Array.apply(null, Array(size));

  let values = createArray(minCapacity);
  let readPtr = 0;
  let writePtr = 0;

  const done = () => readPtr === writePtr;
  const length = () => writePtr - readPtr;
  const reset = () => {
    writePtr = readPtr = 0;
  };
  const reduceCapacity = () => {
    if (length() === 0) {
      reset();
    }
    if (values.length / 2 >= minCapacity && length() < values.length / 2) {
      values = values
        .slice(readPtr, readPtr + length())
        .concat(createArray(values.length / 2 - length()));
      writePtr = length();
      readPtr = 0;
      console.assert(readPtr >= 0);
      console.assert(writePtr >= 0);
    }
  };
  const remove = () => {
    if (done()) {
      reset();
      return;
    }
    const value = values[readPtr];
    values[readPtr] = undefined;
    readPtr += 1;
    reduceCapacity();
    return value;
  };
  const add = value => {
    if (length() + 1 > values.length) {
      if (values.length * 2 > maxCapacity) {
        console.error("queue reached max capacity", values.length, maxCapacity);
        return;
      }
      values.push(...createArray(values.length));
    }
    values[writePtr] = value;
    writePtr += 1;
  };

  return Object.assign(Object.create(null), {
    // Queue
    remove,
    add,
    length,
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
