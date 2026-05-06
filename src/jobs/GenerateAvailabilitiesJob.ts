import { Job, JobBase, QueryBuilder, Schedule } from "@lyra-js/core"

import { Availability } from "@entity/Availability"

@Job()
export class GenerateAvailabilitiesJob extends JobBase {
  @Schedule({ recurrency: "00 15 * * *", enabled: true })
  async generateAvailabilities() {

    const today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth() + 1
    let day = today.getDate()
    const endYear = today.getFullYear()
    const endMonth = today.getMonth() + 4 > 12 ? (today.getMonth() + 4) % 12 : today.getMonth() + 4
    const endDay = new Date(today.getFullYear(), today.getMonth() + 4, 0).getDate()


    const endDateStr = `${endYear}-${String(endMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`
    let dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    while (dateStr <= endDateStr) {
      const query = new QueryBuilder().selectFrom("availability", ["id"]).where("date", "=", dateStr).limit(1, 0)
      const [rows] = (await query.execute()) as [Array<{ id: number }>]

      let openTime = null
      let closeTime = null

      if (rows.length === 0) {
        const scheduleQuery = new QueryBuilder().raw(
          `SELECT * FROM scheduleoverride WHERE DATE(date) = ?`,
          [dateStr]
        )
        const [scheduleRows] = (await scheduleQuery.execute()) as [
          Array<{ is_open: boolean; open_time: string; close_time: string }>
        ]

        if (scheduleRows.length > 0) {
          const isOpen = scheduleRows[0].is_open
          if (!isOpen) {
            const templateQuery = new QueryBuilder()
              .selectFrom("scheduletemplate")
              .where("day_of_week", "=", new Date(year, month - 1, day).getDay())
            const [templateRows] = (await templateQuery.execute()) as [Array<{ open_time: string; close_time: string }>]
            openTime = "14:00"
            closeTime = templateRows[0]?.close_time ?? "20:30"
          }
        } else {
          const templateQuery = new QueryBuilder()
            .selectFrom("scheduletemplate")
            .where("day_of_week", "=", new Date(year, month - 1, day).getDay())
          const [templateRows] = (await templateQuery.execute()) as [Array<{ open_time: string; close_time: string }>]

          openTime = templateRows[0].open_time
          closeTime = templateRows[0].close_time
        }
      }

      if (openTime !== null && closeTime !== null) {
        openTime = this.timeToMinutes(openTime)
        closeTime = this.timeToMinutes(closeTime)

        while (openTime <= closeTime - 15) {
          const startTimeStr = this.minutesToTime(openTime)
          const availability = new Availability()
          availability.date = dateStr
          availability.start_time = availability.start_time = startTimeStr + ':00'
          availability.slots_total = 6
          availability.slots_remaining = 6
          availability.is_open = true
          await this.availabilityRepository.save(availability)
          openTime += 15
        }
      }

      day++
      if (day > new Date(year, month, 0).getDate()) {
        day = 1
        month++
        if (month > 12) {
          month = 1
          year++
        }
      }

      dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }
  }
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":")
    return parseInt(hours) * 60 + parseInt(minutes)
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const minute = Math.floor(minutes % 60)
    const resultHours = String(hours).padStart(2, "0")
    const resultMinutes = String(minute).padStart(2, "0")
    return `${resultHours}:${resultMinutes}`
  }
}
