import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Simulator extends Entity<Simulator> {
  @Column({ type: "bigint", pk: true })
  id: number
  @Column({ type: "varchar", size: 100 })
  name: string = ""
  @Column({ type: "bool" })
  is_active: boolean = true

  constructor(simulator?: Partial<Simulator> | Simulator) {
    super(simulator)
  }
}
