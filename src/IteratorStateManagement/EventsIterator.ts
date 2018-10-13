// https://medium.com/dailyjs/decoupling-business-logic-using-async-generators-cc257f80ab33

export interface IEventsIterator {
  tap: Function;
  // TypeScript does not allow method for AsyncIterableIterator (yet?)
  start: (
    transducers: Array<(trandsducer: AsyncIterableIterator<Object>) => void>,
  ) => void;
  send(item: Object): void;
  main(input: AsyncIterable<Object>): AsyncIterable<Object>;
}

export class AsyncIterator implements IEventsIterator {
  private callback: Function = null;
  private queue: Object[] = [];
  public main: (input: AsyncIterable<Object>) => AsyncIterable<Object>;
  public tap = null;

  public readonly outlet = async function*(source) {
    for await (const item of source) {
      console.log("will yield");
      yield item;
      if (typeof this.tap === "function") {
        console.log("tap is a function");
        await this.tap(item);
      }
    }
  };

  public start(transducers = []) {
    const source = this.share(this.produce());
    const pipeline = this.pipelineTransducers([
      ...transducers,
      this.outlet.bind(this),
    ]);
    const processed = pipeline(this.share(source));
    this.consume(processed);
  }

  public send(item) {
    if (!this.queue.length && this.callback) {
      this.callback();
    }
    this.queue.push(item);
  }

  private share(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    return Object.assign(Object.create(null), {
      next: () => iterator.next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    });
  }

  private produce = async function*() {
    while (true) {
      while (this.queue.length) {
        const value = this.queue.shift();
        yield value;
      }
      await new Promise(i => {
        this.callback = i;
      });
    }
  };

  private async consume(input) {
    for await (const i of input) {
    }
  }

  private pipelineTransducers(transducers = []) {
    const pipeline = item => {
      for (const transducer of transducers) {
        const source = this.share(item);
        item = transducer(source);
      }
      return item;
    };
    return pipeline;
  }
}
