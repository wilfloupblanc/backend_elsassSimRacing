import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Cart extends Entity<Cart> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  user_id: number

  constructor(cart?: Partial<Cart> | Cart) {
    super(cart)
  }
}
