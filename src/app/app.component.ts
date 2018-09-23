import { Component, OnInit } from "@angular/core";
import { WorkerService } from "./services/worker/worker.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  title = "web-worker-v7";

  constructor(private workerService: WorkerService) {}

  async ngOnInit() {
    console.log("ngOnInit this.service", await this.workerService.ping());

    // const ref = Object.create(null);
    // const { input, output } = this.workerService.workerInit(ref);
    // output.subscribe((event: MessageEvent) => {
    //   console.log("Got output:", JSON.stringify(event.data));
    // });
    // input(null);
    // input(1);
    // input(2);
    // input(42);

    // for await (const x of foo()) {
    //   console.log("Worker Ping!", x);
    //   input(x);
    // }
  }
}
