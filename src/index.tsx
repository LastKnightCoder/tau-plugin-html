import { editorMetrics } from "./metrics";
import { messages } from "./i18n";
import { definePlugin } from "@tau/plugins";
import { htmlExtension } from "./editor/extension";
import { htmlBlockCodec, htmlInlineCodec } from "./editor/markdown";
import "./styles.css";

declare const __PLUGIN_META__: { id: string; name: string; version: string };
export default definePlugin({
  ...__PLUGIN_META__,
  i18n: messages,
  editorExtensions: [htmlExtension],
  editorMetrics,
  editorCodecs: [htmlBlockCodec, htmlInlineCodec],
});
