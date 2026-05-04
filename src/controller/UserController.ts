import {
  AccessControl,
  Controller,
  Delete,
  Get,
  isAuthenticated,
  Patch,
  Post,
  Route,
  UnauthorizedException,
  ValidationException,
  Validator
} from "@lyra-js/core"

import { User } from "@entity/User"

@Route({ path: "/user", middlewares: [isAuthenticated] })
export class UserController extends Controller {
  @Get({ path: "/" })
  async list(): Promise<void> {
    try {
      const users = (await this.userRepository.findAll()).map((user: User) => {
        const { password: _password, ...userWithoutPassword } = user
        return userWithoutPassword
      })
      this.res.status(200).json({ message: "Users fetched successfully", users })
    } catch (error) {
      this.next(error)
    }
  }

  @Get({ path: "/:user", resolve: { user: User } })
  async read(user: User) {
    try {
      const { password: _password, ...userWithoutPassword } = user
      this.res.status(200).json({ message: "User fetched successfully", user: userWithoutPassword })
    } catch (error) {
      this.next(error)
    }
  }

  @Post({ path: "/" })
  async create() {
    try {
      const { data }: { data: User } = this.req.body

      if (!data.email || !data.password || !data.firstname || !data.lastname ) {
        new ValidationException("All fields are required.")
      }

      if (!Validator.isEmailValid(data.email)) {
        new ValidationException("Invalid email format.")
      }

      if (!Validator.isPasswordValid(data.password)) {
        new ValidationException(
          "Password is to weak. I must be 10 characters long, including at least 1 lowercase, 1 uppercase, 1 number and 1 special character."
        )
      }

      const isEmailUsed = await this.userRepository.findOneBy({ email: data.email })

      if (isEmailUsed) {
        throw new Error("Email already in use")
      }

      if (!Validator.isPasswordValid(data.password)) {
        throw new Error("Invalid password")
      }

      const user = new User()
      const hashedPassword = await this.bcrypt.hash(data.password, 10)

      user.firstname = data.firstname
      user.lastname = data.lastname
      user.email = data.email
      user.password = hashedPassword
      user.role = "ROLE_USER"

      await this.userRepository.save(data)
      this.res.status(201).json({ message: "User created successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/update-password" })
  async updatePassword() {
    try {
      const { oldPassword, newPassword } = this.req.body
      const user = await this.userRepository.find(this.req.user.id)
      const isValid = await this.bcrypt.compare(oldPassword, user.password)
      if (!isValid) return this.res.status(401).json({ message: "Invalid password" })
      user.password = await this.bcrypt.hash(newPassword, 10)
      await this.userRepository.save(user)
      this.res.status(200).json({ message: "Password updated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/update-email" })
  async updateEmail() {
    try {
      const { email } = this.req.body
      const emailExists = await this.userRepository.findOneBy({ email })
      if (emailExists) return this.res.status(400).json({ message: "Email already in use" })
      const user = await this.userRepository.find(this.req.user.id)
      user.email = email
      await this.userRepository.save(user)
      this.res.status(200).json({ message: "Email updated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Patch({ path: "/:user", resolve: { user: User } })
  async update(user: User) {
    try {
      const { data }: { data: User } = this.req.body
      if (!user) return this.res.status(404).json({ message: "User not found" })
      if (!AccessControl.isOwner(this.req.user, user.id) && !AccessControl.hasRoleHigherThan(this.req.user, user.role))
        throw new UnauthorizedException()

      // Remove sensitive fields from data
      const { password: _password, email: _email, role, ...updateData } = data

      // Keep role if user doesn't have higher privileges
      const finalData = AccessControl.hasRoleHigherThan(this.req.user, user.role) ? updateData : { ...updateData, role }

      finalData.updated_at = new Date()
      await this.userRepository.save(finalData)
      this.res.status(200).json({ message: "Users updated successfully" })
    } catch (error) {
      this.next(error)
    }
  }

  @Delete({ path: "/:id" })
  async delete() {
    try {
      const { id } = this.req.params
      const user = await this.userRepository.find(id)
      if (!user) return this.res.status(404).json({ message: "User not found" })
      if (!AccessControl.isOwner(this.req.user, user.id) && !AccessControl.hasRoleHigherThan(this.req.user, user.role))
        throw new UnauthorizedException()
      if (!user?.id) this.res.status(400).json({ message: "Invalid user id" })
      if (user?.id && id) await this.userRepository.delete(id)
      this.res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
      this.next(error)
    }
  }
}
