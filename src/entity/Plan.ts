import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Plan extends Entity<Plan> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 10, unique: true })
  plan: string = ""

  @Column({ type: "float" })
  price: number = 0.00

  @Column({ type: "varchar", size: 255 })
  stripe_price_id: string = ""

  constructor(plan?: Partial<Plan> | Plan) {
    super(plan)
  }
}