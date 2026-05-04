import { NextFunction, Request, Response } from "@lyra-js/core"

import { BookingRepository } from "@repository/BookingRepository"

export const canManageBooking = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user

  if (!authUser) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (authUser.role === "ROLE_ADMIN") {
    return next()
  }

  const bookingRepository = new BookingRepository()
  const booking = await bookingRepository.find(req.params.booking)

  if (booking?.user_id !== authUser.id) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  next()
}
