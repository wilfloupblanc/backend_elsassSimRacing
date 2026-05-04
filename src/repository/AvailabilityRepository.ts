import { Repository } from "@lyra-js/core"

import { Availability } from "@entity/Availability"

export class AvailabilityRepository extends Repository<Availability> {
  constructor() {
    super(Availability)
  }
}
