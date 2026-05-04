import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class CartItemRecipient extends Entity<CartItemRecipient> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 255 })
  firstname: string
  @Column({ type: "varchar", size: 255 })
  lastname: string
  @Column({ type: "varchar", size: 255 })
  email: string
  @Column({ type: "bigint", fk: true, references: "cartitems.id", onDelete: "CASCADE" })
  cart_item_id: number

  constructor(cartitemrecipient?: Partial<CartItemRecipient> | CartItemRecipient) {
    super(cartitemrecipient)
  }
}
