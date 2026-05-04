import { Fixture } from "@lyra-js/core"

import { Plan } from "@entity/Plan"

export class PlanFixtures extends Fixture {
  load = async () => {
    await this.loadPlans()
  }

  private async loadPlans() {
    const plans = [
      {
        plan: "STARTER",
        price: 19.9,
        stripe_price_id: process.env.STRIPE_SUBSCRIPTION_STARTER_PRICE_ID
      },
      {
        plan: "PLUS",
        price: 49.9,
        stripe_price_id: process.env.STRIPE_SUBSCRIPTION_PLUS_PRICE_ID
      },
      {
        plan: "ULTRA",
        price: 89.9,
        stripe_price_id: process.env.STRIPE_SUBSCRIPTION_ULTRA_PRICE_ID
      }
    ]

    for (const p of plans) {
      const plan = new Plan()
      plan.plan = p.plan
      plan.price = p.price
      plan.stripe_price_id = p.stripe_price_id
      await this.planRepository.save(plan)
    }
  }
}
