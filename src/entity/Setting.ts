import { Column, Entity, Table } from "@lyra-js/core"

@Table()
export class Setting extends Entity<Setting> {
  @Column({ type: "bigint", pk: true })
  id: number

  @Column({ type: "varchar", size: 100 })
  key: string = ""

  @Column({ type: "varchar", size: 255 })
  value: string = ""

  constructor(setting?: Partial<Setting> | Setting) {
    super(setting)
  }
}