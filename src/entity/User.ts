import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class User extends Entity<User> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 255 })
  firstname: string = ""
  @Column({ type: "varchar", size: 255 })
  lastname: string = ""
  @Column({ type: "varchar", size: 255, unique: true })
  email: string = ""
  @Column({ type: "varchar", size: 255 })
  password: string = ""
  @Column({ type: "varchar", size: 255 })
  role: string = "ROLE_USER"
  @Column({ type: "bool" })
  is_member: boolean = false
  @Column({ type: "varchar", size: 255, nullable: true })
  stripe_customer_id: string | null = null
  @Column({ type: "timestamp" })
  created_at: string | Date | null = new Date()
  @Column({ type: "timestamp" })
  updated_at: string | Date | null = new Date()

  constructor(user?: Partial<User> | User) {
    super(user)
  }
}
