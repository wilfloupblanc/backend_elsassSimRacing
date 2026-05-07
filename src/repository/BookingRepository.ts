import { QueryBuilder, Repository } from "@lyra-js/core"

import { Booking } from "@entity/Booking"

export class BookingRepository extends Repository<Booking> {
  constructor() {
    super(Booking)
  }

  async findAvailableSimulator(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<number | null> {
    const busyQuery = new QueryBuilder()
      .selectFrom("booking", ["simulator_id"])
      .where("date", "=", date)
      .andWhere("status", "=", "confirmed")
      .andWhere("start_time", "<", endTime )
      .andWhere("end_time", ">", startTime)

    const [busyRows] = await busyQuery.execute() as [Array<{simulator_id: number}>]

    const busyIds = busyRows.map((row) => row.simulator_id)

    if (!busyIds.length) {
      const [allRows] = await new QueryBuilder()
        .selectFrom("simulator", ["id"])
        .where("is_active", "=", 1)
        .limit(1, 0)
        .execute() as [Array<{id: number}>]
      return allRows.length > 0 ? allRows[0].id : null
    }

    const query = new QueryBuilder()
      .raw("SELECT id FROM simulator WHERE is_active = 1 AND id NOT IN (?) LIMIT 1", [busyIds])

    const [rows] = await query.execute() as [Array<{id: number}>]
    return rows.length > 0 ? rows[0].id : null
  }

  async findByUserId(userId: number): Promise<Booking[]> {
    const query = new QueryBuilder()
      .raw(`
      SELECT 
        b.id,
        b.date,
        b.start_time,
        b.end_time,
        b.status,
        b.price_paid,
        b.pilots,
        s.duration_minutes,
        s.name as session_name
      FROM booking b
      LEFT JOIN session s ON s.id = b.session_id
      WHERE b.user_id = ?
        AND b.availability_id IS NOT NULL
        AND b.status IN ('confirmed', 'pending_payment')
      ORDER BY b.date DESC, b.start_time DESC
    `, [userId])
    const [rows] = await query.execute()
    return rows as Booking[]
  }
}

export const bookingRepository = new BookingRepository()
