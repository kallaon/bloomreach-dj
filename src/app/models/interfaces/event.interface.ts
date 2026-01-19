import { EventType } from "../enums/event-type.enum";

export interface EventProperty {
  property: string;
  type: string | number;
}

export interface Event {
  type: EventType;
  properties: EventProperty[];
}

export interface EventsResponse {
  events: Event[];
}
