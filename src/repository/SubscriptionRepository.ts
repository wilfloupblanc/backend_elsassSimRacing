import { Repository } from "@lyra-js/core"

import { Subscription } from "@entity/Subscription"

export class SubscriptionRepository extends Repository<Subscription> {
  constructor() {
    super(Subscription)
  }
}
