import { Controller, Delete, Get, isAdmin, isAuthenticated, Patch, Post, Route } from "@lyra-js/core"

import { Subscription } from "@entity/Subscription"

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
      let subscription = await this.subscriptionRepository.findOneBy({ user_id: this.req.user.id, status: "active" })
      if (!subscription) {
        subscription = await this.subscriptionRepository.findOneBy({ user_id: this.req.user.id, status: "pending_cancellation" })
      }
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

      // On demande l'annulation en fin de période — l'utilisateur garde ses avantages jusqu'au bout
      // Le webhook subscription.updated passera le statut à pending_cancellation
      // Le webhook subscription.deleted retirera is_member quand la période sera vraiment terminée
      await this.stripeService.instance.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      })

      this.res.status(200).json({ message: "Subscription cancellation scheduled successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/reactivate", middlewares: [isAuthenticated] })
  async reactivate() {
    try {
      const user = await this.userRepository.find(this.req.user.id)
      if (!user.is_member) {
        return this.res.status(400).json({ message: "User is not a member" })
      }

      const subscription = await this.subscriptionRepository.findOneBy({ user_id: user.id, status: "pending_cancellation" })
      if (!subscription) {
        return this.res.status(404).json({ message: "No pending cancellation subscription found" })
      }

      // On annule la demande d'annulation — le webhook subscription.updated repassera le statut à active
      await this.stripeService.instance.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: false
      })

      this.res.status(200).json({ message: "Subscription reactivated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/:subscription/sessions", resolve: { subscription: Subscription }, middlewares: [isAdmin] })
  async updateSessions(subscription: Subscription) {
    try {
      if (!subscription) return this.res.status(404).json({ message: "Subscription not found" })
      const { free_sessions_remaining } = this.req.body
      subscription.free_sessions_remaining = free_sessions_remaining
      await this.subscriptionRepository.save(subscription)
      this.res.status(200).json({ message: "Sessions updated successfully", subscription })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/change-plan", middlewares: [isAuthenticated] })
  async changePlan() {
    const PLAN_ORDER: Record<string, number> = {
      STARTER: 1,
      PLUS: 2,
      ULTRA: 3,
    }
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
      if (subscription.plan === plan) {
        return this.res.status(400).json({ message: "L'utilisateur est déjà sur ce plan" })
      }
      const planData = await this.planRepository.findOneBy({ plan })
      if (!planData) {
        return this.res.status(404).json({ message: "Plan introuvable" })
      }
      const stripeSubscription = await this.stripeService.instance.subscriptions.retrieve(
        subscription.stripe_subscription_id
      )
      const isUpgrade = PLAN_ORDER[plan] > PLAN_ORDER[subscription.plan]
      await this.stripeService.instance.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          items: [{
            id: stripeSubscription.items.data[0].id,
            price: planData.stripe_price_id,
          }],
          proration_behavior: "none",
          ...(isUpgrade ? {} : { billing_cycle_anchor: "unchanged" }),
        }
      )
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