import { Repository } from "@lyra-js/core"

import { Setting } from "@entity/Setting"

export class SettingRepository extends Repository<Setting> {
  constructor() {
    super(Setting)
  }
}
