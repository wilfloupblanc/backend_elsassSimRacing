# Templates Directory

This directory is used for **Server-Side Rendering (SSR)** in LyraJS. It contains template files that are rendered on the server and sent as HTML to the client.

## Why This Folder Exists

LyraJS supports SSR alongside its API-first architecture, allowing you to:
- Render dynamic HTML pages on the server
- Build traditional web applications with server-rendered views
- Mix API endpoints with server-rendered pages in the same application
- Use your preferred templating engine (EJS, Pug, Handlebars, Eta, or Zare)

## Quick Start

### 1. Configure SSR in Your Server

In your `server.ts` file, configure the SSR engine:

```typescript
// ...

const app = createServer()

// Configure SSR
app.setSetting('ssr', {
  engine: 'ejs',              // Choose: 'ejs', 'pug', 'handlebars', 'eta', or 'zare'
  templates: './src/templates', // Path to this directory
  options: {}                 // Optional engine-specific options
})

// ...
```

### 2. Install Your Template Engine

Choose and install one template engine:

```bash
# EJS (simple and fast)
npm install ejs

# Pug (clean syntax, formerly Jade)
npm install pug

# Handlebars (logic-less templates)
npm install handlebars

# Eta (fast, lightweight, similar to EJS)
npm install eta

# Zare (modern template engine)
npm install zare
```

### 3. Create Templates

Create template files in this directory:

```
src/templates/
├── layouts/
│   └── main.ejs
├── pages/
│   ├── home.ejs
│   └── about.ejs
└── partials/
    └── header.ejs
```

**Example template** (`pages/home.ejs`):

```ejs
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1>Welcome, <%= user.name %>!</h1>
  <p><%= message %></p>
</body>
</html>
```

### 4. Render Templates in Controllers

Use the `render()` method in your controllers. Request, Response, and Next are automatically injected as `this.req`, `this.res`, and `this.next`:

```typescript
import { Controller, Get } from "@lyra-js/core"

export class HomeController extends Controller {
  @Get({ path: "/" })
  async index() {
    await this.render('pages/home.ejs', {
      title: 'Home Page',
      user: { name: 'John Doe' },
      message: 'Welcome to LyraJS with SSR!'
    })
  }

  @Get({ path: "/about" })
  async about() {
    await this.render('pages/about.ejs', {
      title: 'About Us',
      company: 'LyraJS'
    })
  }
}
```

## Template Engine Examples

### EJS

```ejs
<!-- pages/profile.ejs -->
<h1>Profile: <%= user.username %></h1>
<% if (user.isAdmin) { %>
  <p>Admin privileges enabled</p>
<% } %>
<ul>
  <% user.posts.forEach(post => { %>
    <li><%= post.title %></li>
  <% }) %>
</ul>
```

### Pug

```pug
//- pages/profile.pug
h1 Profile: #{user.username}
if user.isAdmin
  p Admin privileges enabled
ul
  each post in user.posts
    li= post.title
```

### Handlebars

```handlebars
<!-- pages/profile.hbs -->
<h1>Profile: {{user.username}}</h1>
{{#if user.isAdmin}}
  <p>Admin privileges enabled</p>
{{/if}}
<ul>
  {{#each user.posts}}
    <li>{{title}}</li>
  {{/each}}
</ul>
```

## Best Practices

### 1. Organize Templates by Purpose

```
templates/
├── layouts/          # Main layout templates
│   ├── main.ejs
│   └── admin.ejs
├── pages/           # Full page templates
│   ├── home.ejs
│   ├── about.ejs
│   └── contact.ejs
├── partials/        # Reusable components
│   ├── header.ejs
│   ├── footer.ejs
│   └── navigation.ejs
└── emails/          # Email templates
    ├── welcome.ejs
    └── reset-password.ejs
```

### 2. Mix SSR with API Endpoints

You can combine server-rendered pages with JSON APIs:

```typescript
export class BlogController extends Controller {
  // Server-rendered page
  @Get({ path: "/blog" })
  async blogPage() {
    const posts = await this.postRepository.findAll()
    await this.render('pages/blog.ejs', { posts })
  }

  // JSON API endpoint
  @Get({ path: "/api/blog/posts" })
  async apiPosts() {
    const posts = await this.postRepository.findAll()
    this.ok({ posts })
  }
}
```

### 3. Pass Data from Services

Leverage dependency injection and access request data via `this.req`:

```typescript
export class DashboardController extends Controller {
  @Get({ path: "/dashboard" })
  async index() {
    const stats = await this.analyticsService.getStats()
    const user = await this.userRepository.find(this.req.user.id)

    await this.render('pages/dashboard.ejs', {
      user,
      stats,
      currentDate: new Date()
    })
  }
}
```

## Error Handling

If SSR is not configured or the template engine is not installed, you'll get clear error messages:

```
Error: SSR is not configured. Please configure SSR using app.setSetting("ssr", { engine: "ejs", templates: "./templates" })
```

```
Error: EJS is not installed. Please install it by running: npm install ejs
```

## Advanced Configuration

### Engine-Specific Options

Pass custom options to your template engine:

```typescript
app.setSetting('ssr', {
  engine: 'ejs',
  templates: './src/templates',
  options: {
    cache: process.env.NODE_ENV === 'production',
    compileDebug: process.env.NODE_ENV !== 'production'
  }
})
```

### Multiple Template Directories

While LyraJS uses a single templates directory, you can organize subdirectories as needed:

```typescript
// Render from subdirectories
await this.render(res, 'admin/dashboard.ejs', data)
await this.render(res, 'public/landing.ejs', data)
```

## Need Help?

- **Documentation**: Check the LyraJS documentation for more examples
- **Template Engine Docs**: Refer to the official documentation of your chosen engine
  - [EJS](https://ejs.co/)
  - [Pug](https://pugjs.org/)
  - [Handlebars](https://handlebarsjs.com/)
  - [Eta](https://eta.js.org/)
  - [Zare](https://github.com/zare-js/zare) (if available)

---

**Note**: This directory is optional. If you're building a pure API without server-rendered pages, you can safely delete this folder.
