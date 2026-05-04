import { Column, Entity, Table } from "@lyra-js/core"
@Table()
export class Payments extends Entity<Payments> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "float" })
  amount: number
  @Column({ type: "bigint" })
  number: number
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  related_user_id: number
  @Column({ type: "bigint", fk: true, references: "userorder.id", onDelete: "RESTRICT" })
  order_id: number
  @Column({ type: "varchar", size: 50 })
  status: string = "pending"
  @Column({ type: "varchar", size: 255, nullable: true })
  stripe_charge_id: number
  @Column({ type: "timestamp" })
  created_at: string | Date = new Date()
  constructor(payments?: Partial<Payments> | Payments) {
    super(payments)
  }
}