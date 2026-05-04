import { NextFunction, Request, Response } from "@lyra-js/core"

import { SubscriptionRepository } from "@repository/SubscriptionRepository"

export const canManageSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user

  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (authUser.role === "ROLE_ADMIN") {
    return next()
  }

  const subscriptionRepository = new SubscriptionRepository()
  const subscription = await subscriptionRepository.find(req.params.subscription)

  if (subscription?.user_id !== authUser.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
