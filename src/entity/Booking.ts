import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Booking extends Entity<Booking> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 8 })
  start_time: string = ""
  @Column({ type: "varchar", size: 8 })
  end_time: string = ""
  @Column({ type: "int" })
  pilots: number = 1
  @Column({ type: "float" })
  price_paid: number = 0.00
  @Column({ type: "bool" })
  is_free_session: boolean = false
  @Column({ type: "varchar", size: 50 })
  status: string = "pending"
  @Column({ type: "timestamp", nullable: true })
  cancelled_at: string | Date | null = null
  @Column({ type: "date" })
  date: string | Date = new Date()
  @Column({ type: "bigint", fk: true, references: "user.id", onDelete: "RESTRICT" })
  user_id: number
  @Column({ type: "bigint", fk: true, references: "availability.id", onDelete: "RESTRICT", nullable: true })
  availability_id: number | null = null
  @Column({ type: "bigint", fk: true, references: "simulator.id", onDelete: "RESTRICT", nullable: true })
  simulator_id: number | null = null
  @Column({ type: "bigint", fk: true, references: "session.id", onDelete: "RESTRICT", nullable: true })
  session_id: number | null = null
  @Column({ type: "bigint", fk: true, references: "event.id", onDelete: "RESTRICT", nullable: true })
  event_id: number | null = null
  @Column({ type: "bigint", fk: true, references: "giftvoucher.id", onDelete: "RESTRICT", nullable: true })
  gift_voucher_id: number | null = null
  @Column({ type: "bool" })
  checked_in: boolean = false
  @Column({ type: "varchar", size: 255, nullable: true })
  vehicle: string | null = null
  @Column({ type: "timestamp", nullable: true })
  checked_in_at: string | Date | null = null

  constructor(booking?: Partial<Booking> | Booking) {
    super(booking)
  }
}
