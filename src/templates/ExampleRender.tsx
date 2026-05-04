import { Base } from "./layout/Base"

export default function ExampleRender({ title, content }: { title: string; content: string }) {
  return (
    <Base>
      <section>
        <figure className="logo">
          <img src="/assets/logo.png" alt="LyraJS logo" />
        </figure>
        <h1 className="text-gradient">LyraJS</h1>
        <h2>{title}</h2>
        <p>{content}</p>
        <p className="doc-links">
          <a href="https://lyrajs.dev/documentation/ssr#overview" target="_blank" className="btn">
            SSR Documentation
          </a>
          <a href="https://lyrajs.dev/documentation" target="_blank" className="btn-outline">
            Full Documentation
          </a>
        </p>
      </section>
    </Base>
  )
}
