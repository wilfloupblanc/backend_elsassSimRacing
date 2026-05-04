import { NextFunction, Request, Response } from "@lyra-js/core"

export const YourMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("Your middleware checks or does something here...")
  next()
}
