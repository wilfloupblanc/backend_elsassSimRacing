import { Controller, Delete, Get, isAuthenticated, Patch, Post, Put, Route } from "@lyra-js/core"

import { Subscription } from "@entity/Subscription"
import * as stripe from "stripe"
import { User } from "@entity/User"
import { Plan } from "@app/entity/Plan"

type SubscriptionPlan = "STARTER" | "PLUS" | "ULTRA"

@Route({ path: "/subscription" })
export class SubscriptionController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const subscriptions = await this.subscriptionRepository.findAll()
      this.res.status(200).json({ message: "Subscription list fetched successfully", subscriptions })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/me", middlewares: [isAuthenticated] })
  async me() {
    try {
      const subscription = await this.subscriptionRepository.findOneBy({ user_id: this.req.user.id, status: "active" })
      if (!subscription) return this.res.status(404).json({ message: "Subscription not found" })
      this.res.status(200).json({ message: "Subscription fetched successfully", subscription })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:subscription", resolve: { subscription: Subscription } })
  async read(subscription: Subscription) {
    try {
      if (!subscription) return this.res.status(404).json({ message: "Subscription not found" })
      this.res.status(200).json({ message: "Subscription fetched successfully", subscription })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const subscription = await this.subscriptionRepository.save(data)
      this.res.status(201).json({ message: "Subscription created successfully", subscription })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/subscribe", middlewares: [isAuthenticated] })
  async subscribe() {
    try {
      const { plan } = this.req.body

      if (!plan || !["STARTER", "PLUS", "ULTRA"].includes(plan)) {
        return this.res.status(400).json({ message: "Invalid plan. Must be STARTER, PLUS or ULTRA" })
      }

      const planData = await this.planRepository.findOneBy({ plan })
      if (!planData) {
        return this.res.status(404).json({ message: "Plan not found" })
      }

      const user = await this.userRepository.find(this.req.user.id)

      if (user.is_member) {
        return this.res.status(400).json({ message: "User is already a member" })
      }

      let stripeCustomerId = user.stripe_customer_id
      if (!stripeCustomerId) {
        const customer = await this.stripeService.instance.customers.create({
          email: user.email,
          name: `${user.firstname} ${user.lastname}`
        })
        stripeCustomerId = customer.id
        user.stripe_customer_id = stripeCustomerId
        await this.userRepository.save(user)
      }

      const session = await this.stripeService.instance.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [
          {
            price: planData.stripe_price_id,
            quantity: 1
          }
        ],
        success_url: `${process.env.CLIENT_APP_URL}/subscription/success`,
        cancel_url: `${process.env.CLIENT_APP_URL}/subscription/cancel`,
        metadata: {
          user_id: this.req.user.id,
          plan
        }
      })

      this.res.status(200).json({ url: session.url })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/cancel", middlewares: [isAuthenticated] })
  async cancel() {
    try {
      const user = await this.userRepository.find(this.req.user.id)
      if (!user.is_member) {
        return this.res.status(400).json({ message: "User is not a member" })
      }

      const subscription = await this.subscriptionRepository.findOneBy({ user_id: user.id, status: "active" })
      if (!subscription) {
        return this.res.status(404).json({ message: "Subscription not found" })
      }

      try {
        await this.stripeService.instance.subscriptions.cancel(subscription.stripe_subscription_id)
      } catch (stripeError: unknown) {
        if ((stripeError as { code?: string })?.code !== "resource_missing") throw stripeError
      }

      subscription.status = "canceled"
      await this.subscriptionRepository.save(subscription)

      user.is_member = false
      await this.userRepository.save(user)

      this.res.status(200).json({ message: "Subscription cancelled successfully" })
    } catch (error) {
      this.next(error)
    }
  }




  @Patch({ path: "/change-plan", middlewares: [isAuthenticated] })
  async changePlan() {
    try {
      const { plan } = this.req.body

      if (!plan || !["STARTER", "PLUS", "ULTRA"].includes(plan)) {
        return this.res.status(400).json({ message: "Plan invalide. Doit être STARTER, PLUS ou ULTRA" })
      }

      const user = await this.userRepository.find(this.req.user.id)

      if (!user.is_member) {
        return this.res.status(400).json({ message: "L'utilisateur n'est pas membre" })
      }

      const subscription = await this.subscriptionRepository.findOneBy({ user_id: user.id, status: "active" })
      if (!subscription) {
        return this.res.status(404).json({ message: "Abonnement actif introuvable" })
      }

      const planData = await this.planRepository.findOneBy({ plan })
      if (!planData) {
        return this.res.status(404).json({ message: "Plan introuvable" })
      }

      const stripeSubscription = await this.stripeService.instance.subscriptions.retrieve(
        subscription.stripe_subscription_id
      )

      await this.stripeService.instance.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: planData.stripe_price_id,
          }],
          proration_behavior: "create_prorations",
        }
      )

      subscription.plan = plan
      await this.subscriptionRepository.save(subscription)

      this.res.status(200).json({ message: "Plan mis à jour avec succès" })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:subscription", resolve: { subscription: Subscription } })
  async delete(subscription: Subscription) {
    try {
      if (!subscription?.id) {
        return this.res.status(400).json({ message: "Invalid Subscription id" })
      }
      await this.subscriptionRepository.delete(subscription.id)
      this.res.status(200).json({ message: "Subscription deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}