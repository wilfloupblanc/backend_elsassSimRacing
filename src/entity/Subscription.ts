import { Column, Entity, Table } from "@lyra-js/core"

type SubscriptionPlan = "STARTER" | "PLUS" | "ULTRA"

@Table()
export class Subscription extends Entity<Subscription> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 255, unique: true })
  stripe_subscription_id: string = ""
  @Column({ type: "varchar", size: 10 })
  plan: SubscriptionPlan = "STARTER"
  @Column({ type: "varchar", size: 10, nullable: true })
  pending_plan: SubscriptionPlan | null = null
  @Column({ type: "float" })
  price: number = 0.00
  @Column({ type: "varchar", size: 50 })
  status: string = "active"
  @Column({ type: "timestamp" })
  current_period_start: string | Date = new Date()
  @Column({ type: "timestamp" })
  current_period_end: string | Date = new Date()
  @Column({ type: "int" })
  free_sessions_remaining: number = 0
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  user_id: number
  constructor(subscription?: Partial<Subscription> | Subscription) {
    super(subscription)
  }
}