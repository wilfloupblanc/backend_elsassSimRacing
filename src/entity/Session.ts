import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Session extends Entity<Session> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 100 })
  name: string = ""

  @Column({ type: "tinyint" })
  duration_minutes: number = 0

  @Column({ type: "float" })
  price_normal: number = 0.00

  @Column({ type: "float" })
  price_member: number = 0.00

  @Column({ type: "bool" })
  is_active: boolean = true

  @Column({ type: "text" })
  intro: string = ""

  @Column({ type: "text" })
  details: string = ""

  @Column({ type: "varchar", size: 50 })
  total_duration: string = ""

  @Column({ type: "text", nullable: true })
  tagline: string = ""

  @Column({ type: "varchar", size: 50, nullable: true })
  level: string = ""

  @Column({ type: "varchar", size: 255, nullable: true })
  image: string = ""

  @Column({ type: "tinyint", nullable: true })
  min_age: number = 11

  @Column({ type: "varchar", size: 20, nullable: true })
  min_height: string = "1.50m"

  @Column({ type: "tinyint", nullable: true })
  min_pilots: number = 1

  @Column({ type: "tinyint", nullable: true })
  max_pilots: number = 1

  constructor(session?: Partial<Session> | Session) {
    super(session)
  }
}