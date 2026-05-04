import { AccessControl, Config, isAuthenticated, SecurityConfig } from "@lyra-js/core"
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  rateLimiter,
  Route,
  UnauthorizedException,
  Validator
} from "@lyra-js/core"

import { User } from "@entity/User"

const securityConfig = new SecurityConfig().getConfig()

@Route({ path: "/auth" })
export class AuthController extends Controller {
  @Post({ path: "/sign-up" })
  async signUp() {
    try {
      const { firstname, lastname, email, password, confirm_password } = this.req.body

      if (!firstname || !lastname || !email || !password || !confirm_password) {
        return this.badRequest("Missing required fields")
      }

      if (!Validator.isEmailValid(email)) {
        return this.badRequest("Invalid email")
      }

      const isEmailUsed = await this.userRepository.findOneBy({ email })

      if (isEmailUsed) {
        return this.badRequest("Email already in use")
      }

      if (!Validator.isPasswordValid(password)) {
        return this.badRequest("Invalid password")
      }

      if (confirm_password !== password) {
        return this.badRequest("Invalid password")
      }

      const user = new User()
      const hashedPassword = await this.bcrypt.hash(password, 10)

      user.firstname = firstname
      user.lastname = lastname
      user.email = email
      user.password = hashedPassword
      user.role = "ROLE_USER"

      await this.userRepository.save(user)

      const registeredUser = await this.userRepository.findOneBy({ email })
      const { password: _, ...userWithoutPassword } = registeredUser || {}

      const token = this.jwt.sign({ id: registeredUser.id }, securityConfig.jwt.secret_key as string, {
        algorithm: securityConfig.jwt.algorithm as string,
        expiresIn: securityConfig.jwt.token_expiration
      })

      const refreshToken = this.jwt.sign({ id: registeredUser.id }, securityConfig.jwt.secret_key_refresh as string, {
        algorithm: securityConfig.jwt.algorithm as string,
        expiresIn: securityConfig.jwt.refresh_token_expiration
      })

      this.res.cookie("Token", token, {
        sameSite: "Lax",
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: securityConfig.jwt.token_expiration * 1000,
        partitioned: false
      })

      this.res.cookie("RefreshToken", refreshToken, {
        sameSite: "Lax",
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: securityConfig.jwt.refresh_token_expiration * 1000,
        partitioned: false
      })

      this.res.status(201).json({ message: "User registered successfully", user: userWithoutPassword })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/sign-in", middlewares: [rateLimiter] })
  async signIn() {
    try {
      const { email, password } = this.req.body

      if (!email || !password) {
        return this.badRequest("Missing required fields")
      }

      const user = await this.userRepository.findOneBy({ email })

      if (!user || !(user && (await this.bcrypt.compare(password, user.password)))) {
        return this.unauthorized("Invalid credentials")
      }

      const token = this.jwt.sign({ id: user.id }, securityConfig.jwt.secret_key as string, {
        algorithm: securityConfig.jwt.algorithm as string,
        expiresIn: securityConfig.jwt.token_expiration
      })

      const refreshToken = this.jwt.sign({ id: user.id }, securityConfig.jwt.secret_key_refresh as string, {
        algorithm: securityConfig.jwt.algorithm as string,
        expiresIn: securityConfig.jwt.refresh_token_expiration
      })

      await this.userRepository.save(user)

      this.res.cookie("Token", token, {
        sameSite: "Lax",
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: securityConfig.jwt.token_expiration * 1000,
        partitioned: false
      })

      const base_path = new Config().get("router.base_path")

      this.res.cookie("RefreshToken", refreshToken, {
        path: `${base_path}/auth`,
        sameSite: "Lax",
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: securityConfig.jwt.refresh_token_expiration * 1000,
        partitioned: false
      })

      const { password: _, ...userWithoutPassword } = user

      this.res
        .status(200)
        .json({ message: "User authenticated in successfully", user: userWithoutPassword, token, refreshToken })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/user" })
  async getAuthenticatedUser() {
    try {
      const user = this.req.user as User

      if (!user) throw new UnauthorizedException()

      this.res.status(200).json({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        is_member: user.is_member,
      })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/sign-out" })
  async signOut() {
    try {
      const base_path = new Config().get("router.base_path")
      this.res.clearCookie("Token")
      this.res.clearCookie("RefreshToken", { path: `${base_path}/auth` })
      return this.res.status(200).json({ message: "Unauthenticated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/update-account", middlewares: [isAuthenticated] })
  async updateProfile() {
    try {
      const { data }: { data: User } = this.req.body
      const user = this.req.user as User
      if (!user) throw new UnauthorizedException()
      if (data?.id && data.id !== user.id) throw new UnauthorizedException()

      // Remove protected fields
      const { role: _role, created_at: _created_at, password, ...updateData } = data

      // Hash password if provided
      const hashedPassword = password ? await this.bcrypt.hash(password, 10) : undefined

      const finalData = {
        ...updateData,
        ...(hashedPassword && { password: hashedPassword }),
        updated_at: new Date()
      }

      if (user) await this.userRepository.save(finalData)
      this.res.status(200).json({ message: "Users updated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/refresh-token" })
  async refreshToken() {
    try {
      const securityConfig = new SecurityConfig().getConfig()
      let refreshToken = this.req.cookies.RefreshToken
      if (!refreshToken) {
        const authHeader = this.req.headers.authorization
        if (authHeader && authHeader.startsWith("Bearer ")) {
          refreshToken = authHeader.substring(7)
        }
      }

      AccessControl.checkRefreshTokenValid(refreshToken)

      const decoded = await AccessControl.decodeToken(refreshToken)

      if (!decoded || !decoded.id) throw new UnauthorizedException("Invalid refresh token")

      const user = await this.userRepository.find(decoded.id)

      if (!user) throw new UnauthorizedException("Invalid refresh token")

      const token = await AccessControl.getNewToken(user)

      this.res.cookie("Token", token, {
        sameSite: "Lax",
        httpOnly: true,
        secure: process.env.ENV === "production",
        maxAge: securityConfig.jwt.token_expiration * 1000,
        partitioned: false
      })

      const { password: _, ...userWithoutPassword } = user

      this.res
        .status(200)
        .json({ message: "User authenticated in successfully", user: userWithoutPassword, token, refreshToken })
    } catch (_refreshError) {
      return this.res.redirect(securityConfig.auth_routes.sign_out)
    }
  }

  @Delete({ path: "/delete-account", middlewares: [isAuthenticated] })
  async removeUser() {
    const user = this.req.user

    if (!user) throw new UnauthorizedException()

    await this.userRepository.delete(user.id)

    this.res.clearCookie("Token")
    const base_path = new Config().get("router.base_path")
    this.res.clearCookie("RefreshToken", { path: `${base_path}/auth` })

    this.res.status(200).json({ message: "User deleted successfully" })
  }
}
