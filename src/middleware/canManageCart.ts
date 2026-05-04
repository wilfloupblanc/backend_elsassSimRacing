import { NextFunction, Request, Response } from "@lyra-js/core"

import { CartRepository } from "@repository/CartRepository"

export const canManageCart = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user

  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (authUser.role === "ROLE_ADMIN") {
    return next()
  }

  const cartRepository = new CartRepository()
  const cart = await cartRepository.find(req.params.cart)

  if (cart?.user_id !== authUser.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
