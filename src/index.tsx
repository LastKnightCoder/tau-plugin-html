import { definePlugin } from "@tau/plugins";
import { htmlExtension } from "./editor/extension";
import { htmlBlockCodec, htmlInlineCodec } from "./editor/markdown";
import content from "./skills/html.md";
import "./styles.css";

declare const __PLUGIN_META__: { id: string; name: string; version: string };
export default definePlugin({
  ...__PLUGIN_META__,
  editorExtensions: [htmlExtension],
  editorCodecs: [htmlBlockCodec, htmlInlineCodec],
  skills: [
    {
      id: "authoring",
      name: "HTML 片段",
      description: "在用户要求编写或修改行内、块级 HTML 片段时使用。",
      content,
    },
  ],
});
