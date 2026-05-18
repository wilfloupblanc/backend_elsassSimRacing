import { Column, Entity, Table } from "@lyra-js/core"

type DiscountType = "percent" | "fixed"
type DiscountAppliesTo = "session" | "gift_voucher" | "both"

@Table()
export class DiscountCode extends Entity<DiscountCode> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 50, unique: true })
  code: string = ""

  @Column({ type: "varchar", size: 10 })
  type: DiscountType = "percent"

  @Column({ type: "float" })
  value: number = 0

  @Column({ type: "varchar", size: 20 })
  applies_to: DiscountAppliesTo = "both"

  @Column({ type: "datetime", nullable: true })
  expires_at: Date | null = null

  @Column({ type: "int", nullable: true })
  max_uses: number | null = null

  @Column({ type: "int" })
  uses_count: number = 0

  @Column({ type: "tinyint" })
  is_active: number = 1

  @Column({ type: "timestamp" })
  created_at: Date = new Date()

  constructor(discountCode?: Partial<DiscountCode> | DiscountCode) {
    super(discountCode)
  }
}