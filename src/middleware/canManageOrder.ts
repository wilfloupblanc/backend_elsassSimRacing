import { NextFunction, Request, Response } from "@lyra-js/core"

import { OrderRepository } from "@repository/OrderRepository"

export const canManageOrder = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user

  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (authUser.role === "ROLE_ADMIN") {
    return next()
  }

  const orderRepository = new OrderRepository()
  const order = await orderRepository.find(req.params.order)

  if (order?.related_user_id !== authUser.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
