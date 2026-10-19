// @vitest-environment node
import { build } from "esbuild";
import vm from "node:vm";
import * as react from "react";
import * as jsx from "react/jsx-runtime";
import { expect, it } from "vitest";

it("整个发布入口可无 DOM 求值，codec 和静态导出不执行 UI", async () => {
  const shared = ["@tau/plugins", "@tau/ui", "react", "react/jsx-runtime"];
  const bundle = await build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    write: false,
    format: "cjs",
    platform: "browser",
    jsx: "automatic",
    external: shared,
    loader: { ".md": "text", ".css": "empty" },
    define: {
      __PLUGIN_META__: JSON.stringify({
        id: "tau.html",
        name: "HTML",
        version: "0.1.0",
      }),
    },
  });
  const sdk = new Proxy({}, { get: () => (value: unknown) => value });
  const context = {
    module: { exports: {} as any },
    require: (id: string) => {
      if (id === "react") return react;
      if (id === "react/jsx-runtime") return jsx;
      if (id === "@tau/plugins") return sdk;
      if (id === "@tau/ui") return {};
      throw new Error("未支持的模块：" + id);
    },
  };
  vm.runInNewContext(bundle.outputFiles[0].text, context);
  const extension = context.module.exports.default.editorExtensions[0];
  expect(
    Array.from(extension.elements, (element: any) => element.type),
  ).toEqual(["html-block", "html-inline"]);
  expect(extension.styleSources).toHaveLength(2);
  expect(extension.htmlSerializers[0].toHtml({ html: "<b>内容</b>" })).toBe(
    "<b>内容</b>",
  );
});
