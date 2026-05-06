import { Config, Service } from "@lyra-js/core"
import Stripe from "stripe"

export class StripeService extends Service {
  instance?: Stripe
  sk: string = ""
  pk: string = ""

  constructor() {
    super()

    const config = new Config()
    const apiEnv = config.getParam("api_env")
    const stripeConfig = config.getParam("stripe")

    const { sk_test, pk_test, sk, pk } = stripeConfig

    this.sk = (apiEnv === "prod" || apiEnv === "production") ? sk : sk_test
    this.pk = (apiEnv === "prod" || apiEnv === "production") ? pk : pk_test

    this.instance = new Stripe(this.sk)
  }
}