import { Column, Entity, Table } from "@lyra-js/core"
@Table()
export class UserOrder extends Entity<UserOrder> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "bigint" })
  number: number
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  related_user_id: number
  @Column({ type: "float" })
  amount: number
  @Column({ type: "timestamp" })
  created_at: string | Date = new Date()
  constructor(order?: Partial<UserOrder> | UserOrder) {
    super(order)
  }
}