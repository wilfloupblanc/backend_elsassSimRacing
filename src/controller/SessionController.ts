import { Controller, Delete, Get, Post, Put, Route } from "@lyra-js/core"

import { Session } from "@entity/Session"

@Route({ path: "/session" })
export class SessionController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const sessions = await this.sessionRepository.findAll()
      this.res.status(200).json({ message: "Session list fetched successfully", sessions })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:session", resolve: { session: Session } })
  async read(session: Session) {
    try {
      if (!session) return this.res.status(404).json({ message: "Session not found" })
      this.res.status(200).json({ message: "Session fetched successfully", session })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const session = await this.sessionRepository.save(data)
      this.res.status(201).json({ message: "Session created successfully", session })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:session", resolve: { session: Session } })
  async update(session: Session) {
    try {
      const data = this.req.body
      Object.assign(session, data)
      const updatedSession = await this.sessionRepository.save(session)
      this.res.status(200).json({ message: "Session updated successfully", updatedSession })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:session", resolve: { session: Session } })
  async delete(session: Session) {
    try {
      if (!session?.id) {
        return this.res.status(400).json({ message: "Invalid Session id" })
      }
      await this.sessionRepository.delete(session.id)
      this.res.status(200).json({ message: "Session deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
