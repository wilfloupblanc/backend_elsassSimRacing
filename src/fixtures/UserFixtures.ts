import { Fixture } from "@lyra-js/core"

import { User } from "@entity/User"

export class UserFixtures extends Fixture {
  private users = [
    {
      firstname: "Tristan",
      lastname: "GrandJean",
      email: "tristangrandjean3@gmail.com",
      password: "Titouandu88*"
    },
  ]

  load = async () => {
    await this.loadUsers()
  }

  private loadUsers = async () => {
    for (const u of this.users) {
      const hashedPassword = await this.bcrypt.hash(u.password, 10)
      const user = new User()
      user.firstname = u.firstname
      user.lastname = u.lastname
      user.email = u.email
      user.password = hashedPassword
      user.created_at = new Date()
      user.updated_at = new Date()
      await this.userRepository.save(user)
    }
  }
}
