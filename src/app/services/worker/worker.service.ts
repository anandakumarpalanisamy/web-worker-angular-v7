import { Injectable, Optional } from "@angular/core";
import { Observable, Subscription, ReplaySubject } from "rxjs";

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
  private readonly workers: Map<any, IWorkerObj> = new Map();
  private workerDir({ workerName }) {
    return `/assets/webworkers/${workerName}.worker.js`;
  }

  workerInit(reference: any, workerName: string): IWorkerHandle {
    const worker = new Worker(this.workerDir({ workerName }));

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
