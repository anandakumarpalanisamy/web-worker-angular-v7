import { Component, OnInit } from "@angular/core";
import { WorkerService } from "./services/worker/worker.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "web-worker-v7";

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
    const reference = Object.create(null);
    await this.testWorker(reference, "main");
    await this.testWorker(reference, "another");
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
