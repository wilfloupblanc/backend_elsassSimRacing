import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Availability extends Entity<Availability> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "date" })
  date: string | Date = new Date()
  @Column({ type: "varchar", size: 8 })
  start_time: string = ""
  @Column({ type: "tinyint" })
  slots_total: number = 6
  @Column({ type: "tinyint" })
  slots_remaining: number = 6
  @Column({ type: "bool" })
  is_open: boolean = true

  constructor(availability?: Partial<Availability> | Availability) {
    super(availability)
  }
}
