import { Repository } from "@lyra-js/core"

import { DiscountCode } from "@entity/DiscountCode"

export class DiscountCodeRepository extends Repository<DiscountCode> {
  constructor() {
    super(DiscountCode)
  }
}
