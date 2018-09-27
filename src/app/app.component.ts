import { Component, OnInit } from "@angular/core";
import { WorkerService } from "./services/worker/worker.service";
import { View, Spec } from "vega";

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

  // TS does not parse async generators as class method correctly
  foo = async function*() {
    let i = 0;
    do {
      await new Promise((resolve, reject) => setTimeout(resolve, 1000));
      yield i;
      i += 1;
    } while (i < 3);
  };

  constructor(private workerService: WorkerService) {}

  async ngOnInit() {
    await this.vegaInit();
    await this.vegaLiteInit();

    const reference = Object.create(null);
    await this.testWorker(reference, "main");
    await this.testWorker(reference, "another");
  }

  private async vegaInit() {
    const spec: Spec = JSON.parse(
      await vega
        .loader()
        .load("https://vega.github.io/vega/examples/bar-chart.vg.json"),
    );
    this.view = new vega.View(vega.parse(spec))
      // .renderer("svg")
      .renderer("canvas")
      .initialize("#vegaTest") // initialize view within parent DOM container
      // .width(300)
      // .height(300)
      .hover() // enable hover encode set processing
      .run();
  }

  private async vegaLiteInit() {
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
}
