import { Repository } from "@lyra-js/core"

import { Plan } from "@entity/Plan"

export class PlanRepository extends Repository<Plan> {
  constructor() {
    super(Plan)
  }
}
