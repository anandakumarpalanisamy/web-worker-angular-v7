import { Injectable } from "@angular/core";
import { Observable, Subscription, ReplaySubject } from "rxjs";
import { PlatformCheckService } from "../platform-check/platform-check.service";

export interface IWorkerHandle {
  input: (data: any) => void;
  output: Observable<any>;
}

interface IWorkerObj {
  worker: Worker;
  output: Subscription;
}

@Injectable({
  providedIn: "root",
})
export class WorkerService {
  constructor(platformCheckService: PlatformCheckService) {
    const isEvergreen = platformCheckService.isEvergreen;
    this.workerDir = `/assets/${isEvergreen ? "evergreen" : "ie11"}-webworkers`;
  }

  private workers: Map<any, IWorkerObj> = new Map();
  private readonly workerDir: string;

  workerInit(reference: any, workerName: string): IWorkerHandle {
    const workerUri = `${this.workerDir}/${workerName}.worker.js`;
    const worker = new Worker(workerUri);

    const output = new ReplaySubject(1);
    worker.onmessage = (event: MessageEvent) => {
      output.next(event);
    };
    worker.onerror = (error: any) => {
      output.error(error);
    };
    const outputHandle = output.subscribe();

    const input = (data: any) => {
      worker.postMessage(data);
    };

    this.workers.set(reference, {
      worker,
      output: outputHandle,
    });

    return {
      input,
      get output() {
        return output.asObservable();
      },
    };
  }

  terminate(reference: Object): void {
    console.assert(this.workers.has(reference));

    const { worker, output } = this.workers.get(reference);
    this.workers.delete(reference);
    worker.terminate();
    output.unsubscribe();
  }
}
