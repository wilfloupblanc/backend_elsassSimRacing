import { Controller, Delete, Get, isAdmin, Patch, Post, Put, Route } from "@lyra-js/core"

import { Setting } from "@entity/Setting"

@Route({ path: "/setting" })
export class SettingController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const settings = await this.settingRepository.findAll()
      this.res.status(200).json({ message: "Setting list fetched successfully", settings })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/maintenance/status" })
  async getMaintenanceStatus() {
    try {
      const setting = await this.settingRepository.findOneBy({ key: "maintenance_mode" })
      this.res.status(200).json({
        maintenance: setting?.value === "true"
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:setting", resolve: { setting: Setting } })
  async read(setting: Setting) {
    try {
      if (!setting) return this.res.status(404).json({ message: "Setting not found" })
      this.res.status(200).json({ message: "Setting fetched successfully", setting })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const setting = await this.settingRepository.save(data)
      this.res.status(201).json({ message: "Setting created successfully", setting })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/maintenance/toggle", middlewares: [isAdmin] })
  async toggleMaintenance() {
    try {
      let setting = await this.settingRepository.findOneBy({ key: "maintenance_mode" })

      if (!setting) {
        setting = await this.settingRepository.save({ key: "maintenance_mode", value: "true" })
      } else {
        setting.value = setting.value === "true" ? "false" : "true"
        await this.settingRepository.save(setting)
      }

      this.res.status(200).json({
        message: "Maintenance mode updated",
        maintenance: setting.value === "true"
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:setting", resolve: { setting: Setting } })
  async update(setting: Setting) {
    try {
      const data = this.req.body
      Object.assign(setting, data)
      const updatedSetting = await this.settingRepository.save(setting)
      this.res.status(200).json({ message: "Setting updated successfully", updatedSetting })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:setting", resolve: { setting: Setting } })
  async delete(setting: Setting) {
    try {
      if (!setting?.id) {
        return this.res.status(400).json({ message: "Invalid Setting id" })
      }
      await this.settingRepository.delete(setting.id)
      this.res.status(200).json({ message: "Setting deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
