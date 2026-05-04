import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class ScheduleTemplate extends Entity<ScheduleTemplate> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "tinyint" })
  day_of_week: number
  @Column({ type: "time" })
  open_time: string | Date
  @Column({ type: "time" })
  close_time: string | Date
  @Column({ type: "bool" })
  is_open: boolean = true

  constructor(scheduletemplate?: Partial<ScheduleTemplate> | ScheduleTemplate) {
    super(scheduletemplate)
  }
}
