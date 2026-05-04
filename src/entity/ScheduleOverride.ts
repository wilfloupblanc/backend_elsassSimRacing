import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class ScheduleOverride extends Entity<ScheduleOverride> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "date" })
  date: string | Date
  @Column({ type: "time", nullable: true })
  open_time: string | Date | null = null
  @Column({ type: "time", nullable: true })
  close_time: string | Date | null = null
  @Column({ type: "bool" })
  is_open: boolean = false
  @Column({ type: "varchar", size: 80 })
  description: string

  constructor(scheduleoverride?: Partial<ScheduleOverride> | ScheduleOverride) {
    super(scheduleoverride)
  }
}
