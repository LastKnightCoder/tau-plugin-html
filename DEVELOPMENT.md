# HTML 插件开发

需要 Node.js 22 或更高版本和 pnpm 11.9.0。

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

产物位于 dist/tau.html-<版本>.zip。正式用户通过插件中心安装；开发调试仅使用隔离用户目录，已有安装不得静默覆盖。

节点、Markdown 与插入入口位于 src/editor，异步 Tailwind 样式钩子位于 src/render。块级源码编辑复用 SourceBlockEditor，行内编辑通过 useInlineSource、InlineSourceBoundary 与 insertInlineSource 接入宿主，UI 使用公共 Popover/Input。

两类节点都声明 styleSources，博客发布与静态导出按相同字段收集样式。宿主不提供服务时不在浏览器中编译 Tailwind，博客使用发布时生成的 CSS。

同步 manifest.json 与 package.json 版本，提交后推送对应标签（如 v0.1.0）。.github/workflows/release.yml 会冻结安装、运行测试与构建，并上传完整 ZIP 到 GitHub Release。Release 不等于插件中心审核通过。

作者接口见 EDITOR.md 与 API.md。当前使用 SDK 0.17.0，不修改客户端版本。
