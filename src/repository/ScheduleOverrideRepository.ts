import { Repository } from "@lyra-js/core"

import { ScheduleOverride } from "@entity/ScheduleOverride"

export class ScheduleOverrideRepository extends Repository<ScheduleOverride> {
  constructor() {
    super(ScheduleOverride)
  }
}
