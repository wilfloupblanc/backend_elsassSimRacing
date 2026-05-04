import { Repository } from "@lyra-js/core"

import { Payments } from "@entity/Payments"

export class PaymentsRepository extends Repository<Payments> {
  constructor() {
    super(Payments)
  }
}
