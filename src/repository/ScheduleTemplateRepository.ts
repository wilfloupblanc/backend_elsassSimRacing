import { Repository } from "@lyra-js/core"

import { ScheduleTemplate } from "@entity/ScheduleTemplate"

export class ScheduleTemplateRepository extends Repository<ScheduleTemplate> {
  constructor() {
    super(ScheduleTemplate)
  }
}
