import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class FreeSessionToken extends Entity<FreeSessionToken> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 64, unique: true })
  qr_token: string = ""

  @Column({ type: "bool" })
  is_used: boolean = false

  @Column({ type: "timestamp", nullable: true })
  used_at: string | Date | null = null

  @Column({ type: "timestamp" })
  created_at: string | Date = new Date()

  @Column({ type: "bigint", fk: true, references: "subscription.id", onDelete: "RESTRICT" })
  sub_id: number

  constructor(token?: Partial<FreeSessionToken> | FreeSessionToken) {
    super(token)
  }
}