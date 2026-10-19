import { expect, it } from "vitest";
import { htmlBlockCodec, htmlInlineCodec } from "../editor/markdown";

it("原生 HTML 按块级与行内认领，保留 html/openEdit", () => {
  const context = {} as any;
  expect(
    htmlBlockCodec.importNode!(
      { type: "html", value: "<div>块</div>" },
      context,
    ),
  ).toMatchObject({ type: "html-block", html: "<div>块</div>" });
  expect(
    htmlInlineCodec.importNode!(
      { type: "html", htmlType: "inline", value: "<b>行内</b>" },
      context,
    ),
  ).toMatchObject({
    type: "html-inline",
    html: "<b>行内</b>",
    openEdit: false,
  });
  expect(
    htmlBlockCodec.importNode!({ type: "html", htmlType: "inline" }, context),
  ).toBeNull();
  expect(
    htmlInlineCodec.importNode!({ type: "code", lang: "html" }, context),
  ).toBeNull();
});
it("序列化保留原始 HTML，段落内降级不丢失源码", () => {
  for (const codec of [htmlBlockCodec, htmlInlineCodec]) {
    expect(
      codec.serializer!.toMarkdown!(
        { html: " <b>原始</b> " } as any,
        {} as any,
      ),
    ).toBe(" <b>原始</b> ");
  }
  expect(htmlBlockCodec.inlineForm!({ html: "<div>块</div>" })).toMatchObject({
    type: "html-inline",
    html: "<div>块</div>",
  });
});
