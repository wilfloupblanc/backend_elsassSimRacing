import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Event extends Entity<Event> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 255 })
  title: string = ""

  @Column({ type: "text", nullable: true })
  description: string | null = null

  @Column({ type: "date" })
  date: string | Date = new Date()

  @Column({ type: "varchar", size: 8 })
  start_time: string = ""

  @Column({ type: "varchar", size: 8 })
  end_time: string = ""

  @Column({ type: "tinyint" })
  simulators_count: number = 1

  @Column({ type: "tinyint" })
  pilots_per_simulator: number = 1

  @Column({ type: "float" })
  price: number = 0.00

  @Column({ type: "text", nullable: true })
  vehicles: string | null = null

  @Column({ type: "text", nullable: true })
  vehicle_categories: string | null = null

  @Column({ type: "varchar", size: 50 })
  access: string = "all"

  @Column({ type: "timestamp", nullable: true })
  created_at: string | Date | null = new Date()

  constructor(event?: Partial<Event> | Event) {
    super(event)
  }
}