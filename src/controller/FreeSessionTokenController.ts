import { Controller, Delete, Get, Post, Put, Route } from "@lyra-js/core"
import { FreeSessionToken } from "@entity/FreeSessionToken"

@Route({ path: "/freeSessionToken" })
export class FreeSessionTokenController extends Controller {
  @Get({ path: "/" })
  async list() {
    try {
      const freesessiontokens = await this.freeSessionTokenRepository.findAll()
      this.res.status(200).json({ message: "FreeSessionToken list fetched successfully", freesessiontokens })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/validate/:token" })
  async validate() {
    try {
      const { token } = this.req.params

      const freeSessionToken = await this.freeSessionTokenRepository.findOneBy({ qr_token: token })

      if (!freeSessionToken) {
        return this.res.status(404).json({ valid: false, reason: "Token introuvable" })
      }

      if (freeSessionToken.is_used) {
        return this.res.status(409).json({
          valid: false,
          reason: "Session déjà utilisée",
          used_at: freeSessionToken.used_at
        })
      }

      // Invalider le token
      freeSessionToken.is_used = true
      freeSessionToken.used_at = new Date()
      await this.freeSessionTokenRepository.save(freeSessionToken)

      // Décrémenter free_sessions_remaining
      const subscription = await this.subscriptionRepository.find(freeSessionToken.sub_id)
      subscription.free_sessions_remaining -= 1
      await this.subscriptionRepository.save(subscription)

      // Récupérer l'utilisateur pour l'affichage
      const user = await this.userRepository.find(subscription.user_id)

      this.res.status(200).json({
        valid: true,
        user,
        subscription,
        free_sessions_remaining: subscription.free_sessions_remaining
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:freesessiontoken", resolve: { freesessiontoken: FreeSessionToken } })
  async read(freesessiontoken: FreeSessionToken) {
    try {
      if (!freesessiontoken) return this.res.status(404).json({ message: "FreeSessionToken not found" })
      this.res.status(200).json({ message: "FreeSessionToken fetched successfully", freesessiontoken })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const data = this.req.body
      const freesessiontoken = await this.freeSessionTokenRepository.save(data)
      this.res.status(201).json({ message: "FreeSessionToken created successfully", freesessiontoken })
    } catch (error) {
      this.next(error)
    }
  }

  @Put({ path: "/:freesessiontoken", resolve: { freesessiontoken: FreeSessionToken } })
  async update(freesessiontoken: FreeSessionToken) {
    try {
      const data = this.req.body
      Object.assign(freesessiontoken, data)
      const updatedFreeSessionToken = await this.freeSessionTokenRepository.save(freesessiontoken)
      this.res.status(200).json({ message: "FreeSessionToken updated successfully", updatedFreeSessionToken })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:freesessiontoken", resolve: { freesessiontoken: FreeSessionToken } })
  async delete(freesessiontoken: FreeSessionToken) {
    try {
      if (!freesessiontoken?.id) {
        return this.res.status(400).json({ message: "Invalid FreeSessionToken id" })
      }
      await this.freeSessionTokenRepository.delete(freesessiontoken.id)
      this.res.status(200).json({ message: "FreeSessionToken deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}