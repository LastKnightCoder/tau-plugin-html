import type { EditorMarkdownCodec } from "@tau/plugins";
import type { HtmlBlockElement, HtmlInlineElement } from "./types";

export const htmlBlockCodec: EditorMarkdownCodec = {
  type: "html-block",
  importNode: (node) =>
    node.type === "html" && node.htmlType !== "inline"
      ? ({
          type: "html-block",
          html: node.value ?? "",
          children: [{ type: "formatted", text: "" }],
        } as HtmlBlockElement)
      : null,
  inlineForm: (element) =>
    ({
      type: "html-inline",
      html: element.html,
      children: [{ type: "formatted", text: "" }],
    }) as HtmlInlineElement,
  serializer: { isBlock: true, toMarkdown: (element) => element.html || "" },
};
export const htmlInlineCodec: EditorMarkdownCodec = {
  type: "html-inline",
  importNode: (node) =>
    node.type === "html" && node.htmlType === "inline"
      ? ({
          type: "html-inline",
          html: node.value ?? "",
          openEdit: false,
          children: [{ type: "formatted", text: "" }],
        } as HtmlInlineElement)
      : null,
  serializer: { toMarkdown: (element) => element.html || "" },
};
