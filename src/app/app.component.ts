import { Component, OnInit } from "@angular/core";
import { View, Spec } from "vega";
import { WorkerService } from "./services/worker/worker.service";
import { IterableQueue } from "../iterable-queue";

declare var vega: any;
declare var vegaEmbed: (containerId: string, spec: any) => void;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "web-worker-v7";

  view: View;
  viewLite: View;

  constructor(private workerService: WorkerService) {}

  async ngOnInit() {
    this.test();

    this.vegaInit();
    this.vegaLiteInit();

    this.testWorker(Object.create(null), "main");
    this.testWorker(Object.create(null), "another");
  }

  private test() {
    const foo = new Foo();
    foo.start();
  }

  private async vegaInit() {
    const spec: Spec = JSON.parse(
      await vega
        .loader()
        .load("https://vega.github.io/vega/examples/bar-chart.vg.json"),
    );
    this.view = new vega.View(vega.parse(spec))
      // .renderer("svg")
      .initialize("#vegaTest") // initialize view within parent DOM container
      // .width(300)
      // .height(300)
      .hover() // enable hover encode set processing
      .run();
  }

  private vegaLiteInit() {
    const spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v3.0.0-rc6.json",
      description: "A simple bar chart with embedded data.",
      data: {
        values: [
          { a: "A", b: 28 },
          { a: "B", b: 55 },
          { a: "C", b: 43 },
          { a: "D", b: 91 },
          { a: "E", b: 81 },
          { a: "F", b: 53 },
          { a: "G", b: 19 },
          { a: "H", b: 87 },
          { a: "I", b: 52 },
        ],
      },
      mark: "bar",
      encoding: {
        x: { field: "a", type: "ordinal" },
        y: { field: "b", type: "quantitative" },
      },
    };
    vegaEmbed("#vegaLiteTest", spec);
  }

  private async testWorker(reference: any, workerName: string) {
    const { input, output } = this.workerService.workerInit(
      reference,
      workerName,
    );
    output.subscribe((event: MessageEvent) => {
      console.log("Got output:", JSON.stringify(event.data));
    });
    for await (const x of this.foo()) {
      input(x);
    }
    this.workerService.terminate(reference);
  }

  // TS does not parse async generators as class method correctly
  private readonly foo = async function*() {
    let i = 0;
    do {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
      yield i;
      i += 1;
    } while (i < 3);
  };
}

abstract class AsyncGenThingy {
  private callback: () => void;
  private queue = IterableQueue();
  protected abstract main;

  private share(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();
    return Object.assign(Object.create(null), {
      next: () => iterator.next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    });
  }

  protected send(event) {
    if (!this.queue.length() && this.callback) {
      this.callback();
    }
    this.queue.add(event);
  }

  protected readonly produce = async function*() {
    for (;;) {
      while (this.queue.length()) {
        const value = this.queue.remove();
        yield value;
      }
      await new Promise(i => (this.callback = i));
    }
  };

  protected async consume(input) {
    for await (const i of input) {
    }
  }
}

class Foo extends AsyncGenThingy {
  constructor() {
    super();
  }

  public start() {
    document.addEventListener(
      "pointermove",
      (...args) => this.send(...args),
      false,
    );
    document.addEventListener(
      "pointerdown",
      (...args) => this.send(...args),
      false,
    );
    document.addEventListener(
      "pointerup",
      (...args) => this.send(...args),
      false,
    );
    this.consume(this.main(this.produce()));
  }

  protected readonly main = async function*(input) {
    const source = this.share(input);
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
}
