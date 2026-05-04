import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class GiftVoucher extends Entity<GiftVoucher> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 200 })
  recipient_name: string = ""
  @Column({ type: "varchar", size: 255 })
  recipient_email: string = ""
  @Column({ type: "varchar", size: 255, unique: true })
  qr_code: string = ""
  @Column({ type: "varchar", size: 50 })
  status: string = "valid"
  @Column({ type: "timestamp", nullable: true })
  used_at: string | Date | null = null
  @Column({ type: "varchar", size: 255 })
  stripe_payment_intent_id: string = ""
  @Column({ type: "float" })
  amount_paid: number = 0.00
  @Column({ type: "timestamp", nullable: true })
  expires_at: string | Date | null = null
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  purchaser_user_id: number
  @Column({ type: "bigint", fk: true, references: "session.id", onDelete: "RESTRICT" })
  session_id: number

  constructor(giftvoucher?: Partial<GiftVoucher> | GiftVoucher) {
    super(giftvoucher)
  }
}
