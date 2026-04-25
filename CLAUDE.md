
Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Project Workflow Prompt

当用户提出类似“整理设计系统数据 / 根据来源链接补充基础数据 / 更新页面展示 / 同步 README / 增加脚本自动化”的需求时，默认按下面的理解执行，不需要反复确认细节：

1. 先把页面展示数据抽离为独立 JSON 数据源，放在 `src/data/` 下。
2. 每条设计系统数据默认补齐这些字段：
   - `title`
   - `description.zh`
   - `description.en`
   - `website`
   - `github`
   - `image`
   - `tags`，标签使用中英文字段，适合展示如 `【组件】`、`【Vue】`、`【React】`、`【设计系统】`
3. 页面修改默认要求：
   - 支持中文/英文切换
   - 标签、说明、按钮文案跟随语言切换
   - 卡片信息层级清晰，标题优先，标签不要喧宾夺主
4. 若仓库存在 `SOURCE.md`，将其视为外部来源列表：
   - 从其中的链接抓取原始数据
   - 生成结构化补充数据文件，默认放在 `src/data/sourceDesignSystems.json`
   - 原始来源数据与人工整理后的主数据分开维护
5. README 默认同步更新，并且优先脚本化：
   - 编写脚本根据 JSON 自动更新 README
   - README 中保留固定标记区块，避免覆盖手写说明
   - 在 README 中写明如何执行同步命令
6. 新增脚本时，默认在 `scripts/` 下创建，并在 `package.json` 中补充对应命令。
7. 修改完成后，默认执行能跑通的验证命令，例如：
   - `bun run update:readme`
   - `bun run update:sources`
   - `bun run build`
8. 输出结果时，优先说明：
   - 改了什么
   - 数据文件和脚本放在哪里
   - 执行了哪些验证
   - 如果有来源数据只是“原始抓取”而非“人工校正”，要明确说明

可直接使用的用户提示词模板：

```md
请按仓库既有的 ui-design-system 数据规范处理这次需求：如果涉及设计系统列表，先维护 `src/data/` 下的 JSON 主数据，补齐中英文说明、官网、GitHub、图片和标签；如果涉及来源链接，则把 `SOURCE.md` 作为外部来源入口，抓取并生成补充原始数据文件；如果涉及展示页面，则同步支持中英文切换并优化卡片信息层级；如果涉及文档，则优先写脚本自动更新 README，并在完成后执行相关脚本和构建验证。
```
