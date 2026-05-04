import { Column, Entity, Table } from "@lyra-js/core"
@Table()
export class OrderDetails extends Entity<OrderDetails> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "float" })
  price_each: number
  @Column({ type: "bigint", fk: true, references: "session.id", nullable: true, onDelete: "RESTRICT" })
  session_id: number | null
  @Column({ type: "bigint", fk: true, references: "booking.id", nullable: true, onDelete: "RESTRICT" })
  booking_id: number | null
  @Column({ type: "bigint", fk: true, references: "giftvoucher.id", nullable: true, onDelete: "RESTRICT" })
  gift_voucher_id: number | null = null
  @Column({ type: "int" })
  quantity: number
  @Column({ type: "bigint", fk: true, references: "userorder.id", onDelete: "RESTRICT" })
  order_id: number
  constructor(orderdetails?: Partial<OrderDetails> | OrderDetails) {
    super(orderdetails)
  }
}