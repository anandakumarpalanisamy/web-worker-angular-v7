import { IEventsIterator } from "./EventsIterator";

export interface IIteratorStateManagement {
  eventsProcessor: IEventsIterator;
  updateState: (item: Object) => void;
}
