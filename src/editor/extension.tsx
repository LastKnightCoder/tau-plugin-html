import { Code, FileCode } from "lucide-react";
import {
  defineEditorElement,
  defineEditorExtension,
  insertSourceBlock,
  insertInlineSource,
  sourceBlockParagraphBehavior,
} from "@tau/plugins";
import { HtmlBlock } from "./HtmlBlock";
import { HtmlInline } from "./HtmlInline";
import type { HtmlBlockElement, HtmlInlineElement } from "./types";

export const htmlExtension = defineEditorExtension({
  id: "tau.html",
  elements: [
    defineEditorElement<HtmlBlockElement>({
      type: "html-block",
      dataVersion: 1,
      collaboration: { textFields: ["html"] },
      kind: "block",
      isVoid: true,
      drag: true,
      isEmpty: (element) => !element.html,
      render: (props) => <HtmlBlock {...props} />,
    }),
    defineEditorElement<HtmlInlineElement>({
      type: "html-inline",
      dataVersion: 1,
      collaboration: { textFields: ["html"] },
      kind: "inline",
      isVoid: true,
      isEmpty: (element) => !element.html,
      render: (props) => <HtmlInline {...props} />,
    }),
  ],
  blockPanel: [
    {
      icon: FileCode,
      title: "HTML",
      keywords: ["html", "块级", "行内"],
      description: "插入 HTML 代码",
      children: [
        {
          icon: FileCode,
          title: "块级HTML",
          keywords: ["html-block", "HTML块", "kuaiji"],
          description: "块级 HTML",
          onClick: (editor) => {
            insertSourceBlock(editor, {
              type: "html-block",
              html: "",
              children: [{ type: "formatted", text: "" }],
            });
          },
        },
        {
          icon: Code,
          title: "行内HTML",
          keywords: ["html-inline", "行内HTML", "hangnei"],
          description: "行内 HTML",
          onClick: (editor) => {
            insertInlineSource(editor, {
              type: "html-inline",
              html: "",
              children: [{ type: "formatted", text: "" }],
            });
          },
        },
      ],
    },
  ],
  behaviorsFor: { paragraph: sourceBlockParagraphBehavior("html-block") },
  styleSources: [
    { type: "html-block", field: "html", language: "html" },
    { type: "html-inline", field: "html", language: "html" },
  ],
  htmlSerializers: ["html-block", "html-inline"].map((type) => ({
    type,
    toHtml: (element) => (typeof element.html === "string" ? element.html : ""),
  })),
});
