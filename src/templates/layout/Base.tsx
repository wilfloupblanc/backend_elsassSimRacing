import { PropsWithChildren } from "@lyra-js/core"

import { Footer } from "./Footer"
import { Header } from "./Header"

export function Base({ children }: PropsWithChildren) {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/assets/logo.png" />
        <title>LyraJS App</title>
        <link rel="stylesheet" href="/assets/styles/app.css" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
