import { NextFunction, Request, Response } from "@lyra-js/core"

import { SettingRepository } from "@repository/SettingRepository"

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (
    req.url.startsWith("/api/auth") ||
    req.url.startsWith("/api/setting/maintenance")
  ) {
    return next()
  }

  const settingRepository = new SettingRepository()
  const setting = await settingRepository.findOneBy({ key: "maintenance_mode" })

  if (setting?.value === "true") {
    return res.status(503).json({ message: "Site en maintenance. Revenez bientôt." })
  }

  next()
}