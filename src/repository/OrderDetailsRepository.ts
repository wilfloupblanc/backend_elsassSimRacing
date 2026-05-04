import { Repository } from "@lyra-js/core"

import { OrderDetails } from "@entity/OrderDetails"

export class OrderDetailsRepository extends Repository<OrderDetails> {
  constructor() {
    super(OrderDetails)
  }
}
