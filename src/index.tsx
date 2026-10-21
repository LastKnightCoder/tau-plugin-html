import { definePlugin } from "@tau/plugins";
import { htmlExtension } from "./editor/extension";
import { htmlBlockCodec, htmlInlineCodec } from "./editor/markdown";
import "./styles.css";

declare const __PLUGIN_META__: { id: string; name: string; version: string };
export default definePlugin({
  ...__PLUGIN_META__,
  editorExtensions: [htmlExtension],
  editorCodecs: [htmlBlockCodec, htmlInlineCodec],
});
