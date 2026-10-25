import { CodeXml } from "lucide-react";
import {
  SourceBlockEditor,
  useSourceBlock,
  type EditorElementRenderProps,
} from "@tau/plugins";
import { useRuntimeCss } from "../render/useRuntimeCss";
import type { HtmlBlockElement } from "./types";

export function HtmlBlock({
  attributes,
  children,
  element,
}: EditorElementRenderProps<HtmlBlockElement>) {
  const { compiler } = useSourceBlock(element);
  const css = useRuntimeCss(element.html, compiler);
  return (
    <div {...attributes}>
      <SourceBlockEditor
        mode="htmlmixed"
        title="HTML"
        icon={CodeXml}
        field="html"
        element={element}
        extend
      >
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
        <div
          data-tau-html-block
          dangerouslySetInnerHTML={{ __html: element.html }}
        />
      </SourceBlockEditor>
      {children}
    </div>
  );
}
