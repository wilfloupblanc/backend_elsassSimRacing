import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class CartItems extends Entity<CartItems> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "bigint", fk: true, references: "cart.id", onDelete: "RESTRICT" })
  cart_id: number
  @Column({ type: "bigint", fk: true, references: "session.id", onDelete: "RESTRICT" })
  session_id: number
  @Column({ type: "int" })
  quantity: number

  constructor(cartitems?: Partial<CartItems> | CartItems) {
    super(cartitems)
  }
}
