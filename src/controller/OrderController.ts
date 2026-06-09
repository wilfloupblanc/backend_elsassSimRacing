import { Controller, Delete, Get, isAuthenticated, Post, Put, QueryBuilder, Route } from "@lyra-js/core"

import { UserOrder } from "@entity/UserOrder"
import { CartInterface } from "@repository/CartRepository"
import Stripe from "stripe"

@Route({ path: "/order" })
export class OrderController extends Controller {
  @Get({ path: "/all", middlewares: [isAuthenticated] })
  async list() {
    try {
      const query = new QueryBuilder()
        .selectFrom("userorder", ["id", "number", "amount", "created_at"])
        .where("related_user_id", "=", this.req.user.id)
        .orderBy("created_at", "DESC")
      const [orders] = await query.execute()
      this.res.status(200).json({ message: "Order list fetched successfully", orders })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/last", middlewares: [isAuthenticated] })
  async last() {
    try {
      const userId = this.req.user.id
      const orders = await this.orderRepository.findLastOrderWithDetails(userId)
      const order = orders[0]
      if (!order) return this.res.status(404).json({ message: "Order not found" })
      this.res.status(200).json({ message: "Order fetched successfully", orders })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async read(order: UserOrder) {
    try {
      if (!order) return this.res.status(404).json({ message: "Order not found" })
      this.res.status(200).json({ message: "Order fetched successfully", order })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/", middlewares: [isAuthenticated] })
  async create() {
    try {
      const data = this.req.body
      const order = await this.orderRepository.save(data)
      this.res.status(201).json({ message: "Order created successfully", order })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/checkout", middlewares: [isAuthenticated] })
  async checkout() {
    try {
      const cart = await this.cartRepository.findOneBy({ user_id: this.req.user.id })
      const {
        availability_id,
        session_id,
        pilots,
        event_id,
        event_price,
        event_title,
        pilots_count,
        selected_vehicle,
        discount_code
      } = this.req.body
      const sessions = session_id ? await this.sessionRepository.find(session_id) : null
      const user = await this.userRepository.find(this.req.user.id)
      const subscription = await this.subscriptionRepository.findOneBy({ user_id: user.id })
      const hasMemberPrice = user.is_member && subscription?.plan !== "STARTER"

      let discount = null
      if (discount_code) {
        discount = await this.discountCodeRepository.findOneBy({ code: discount_code })
      }

      const applyDiscount = (amountInCents: number): number => {
        if (!discount) return amountInCents
        if (discount.type === 'percent') {
          return Math.round(amountInCents * (1 - discount.value / 100))
        }
        return Math.max(0, amountInCents - Math.round(discount.value * 100))
      }

      const cartLineItems = cart
        ? (await this.cartRepository.findUserCartItems(cart.id)).map((item: CartInterface) => ({
          price_data: {
            currency: "eur",
            product_data: { name: `Ticket ${item.duration_minutes} minutes` },
            unit_amount: applyDiscount(item.price_normal * 100)
          },
          quantity: item.quantity
        }))
        : []

      const reservationLineItem = sessions
        ? [
          {
            price_data: {
              currency: "eur",
              product_data: { name: `Réservation simulateur - ${sessions.duration_minutes} minutes` },
              unit_amount: applyDiscount(Math.round(hasMemberPrice ? sessions.price_member * 100 : sessions.price_normal * 100))
            },
            quantity: 1
          },
          ...(pilots > 1 ? [{
            price_data: {
              currency: "eur",
              product_data: { name: `Réservation simulateur - ${sessions.duration_minutes} minutes` },
              unit_amount: applyDiscount(Math.round(sessions.price_normal * 100))
            },
            quantity: pilots - 1
          }] : [])
        ]
        : []

      const eventLineItem = event_id
        ? [
          {
            price_data: {
              currency: "eur",
              product_data: { name: `Inscription événement - ${event_title}` },
              unit_amount: applyDiscount(Math.round(event_price * 100))
            },
            quantity: 1
          }
        ]
        : []

      const lineItems = [...cartLineItems, ...reservationLineItem, ...eventLineItem]

      const session = await this.stripeService.instance.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: `${process.env.CLIENT_APP_URL}/order/success`,
        cancel_url: `${process.env.CLIENT_APP_URL}/order/cancel`,
        metadata: {
          user_id: this.req.user.id,
          session_id: session_id ?? null,
          pilots: pilots ?? null,
          availability_id: availability_id ?? null,
          event_id: event_id ?? null,
          pilots_count: pilots_count ?? null,
          selected_vehicle: selected_vehicle ?? null,
          discount_code: discount_code ?? null
        }
      })

      this.res.status(200).json({ url: session.url })
    } catch (error) {
      console.log("Checkout error:", error)
      this.next(error)
    }
  }

  @Post({ path: "/webhook", parserType: "raw" })
  async webhook() {
    console.log("WEBHOOK CALLED")
    try {
      const signature = this.req.headers["stripe-signature"]
      const event = this.stripeService.instance.webhooks.constructEvent(
        this.req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )

      console.log("WEBHOOK EVENT TYPE:", event.type)

      if (event.type === "checkout.session.completed") {
        this.res.status(200).json({ received: true })
        ;(async () => { await this.stripeService.handleCheckoutCompleted(event) })()
      } else if (event.type === "customer.subscription.updated") {
        await this.stripeService.handleSubscriptionUpdated(event)
        this.res.status(200).json({ received: true })
      } else if (event.type === "customer.subscription.created") {
        this.res.status(200).json({ received: true })
        ;(async () => { await this.stripeService.handleSubscriptionCreated(event) })()
      } else if (event.type === "customer.subscription.deleted") {
        await this.stripeService.handleSubscriptionDeleted(event)
        this.res.status(200).json({ received: true })
      } else if (event.type === "invoice.paid") {
        this.res.status(200).json({ received: true })
        const invoice = event.data.object as Stripe.Invoice & { billing_reason: string }
        if (invoice.billing_reason !== "subscription_create") {
          ;(async () => { await this.stripeService.handleInvoicePaid(event) })()
        }
      }else {
        this.res.status(200).json({ received: true })
      }
    } catch (error) {
      console.log("WEBHOOK ERROR:", error)
      this.next(error)
    }
  }

  @Put({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async update(order: UserOrder) {
    try {
      const data = this.req.body
      Object.assign(order, data)
      const updatedOrder = await this.orderRepository.save(order)
      this.res.status(200).json({ message: "Order updated successfully", updatedOrder })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:order", resolve: { order: UserOrder }, middlewares: [isAuthenticated] })
  async delete(order: UserOrder) {
    try {
      if (!order?.id) {
        return this.res.status(400).json({ message: "Invalid Order id" })
      }
      await this.orderRepository.delete(order.id)
      this.res.status(200).json({ message: "Order deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
