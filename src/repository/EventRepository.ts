import { Repository } from "@lyra-js/core"

import { Event } from "@entity/Event"

export class EventRepository extends Repository<Event> {
  constructor() {
    super(Event)
  }
}
