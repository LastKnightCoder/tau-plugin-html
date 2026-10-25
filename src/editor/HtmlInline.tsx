import { useCallback, useEffect, useRef, useState } from "react";
import { InlineSourceBoundary, useInlineSource, useTextField, usePluginEnvironment, type EditorElementRenderProps } from "@tau/plugins";
import { Button, Dialog, DialogBody, Input, Popover } from "@tau/ui";
import { useRuntimeCss } from "../render/useRuntimeCss";
import type { HtmlInlineElement } from "./types";

export function HtmlInline({ attributes, children, element }: EditorElementRenderProps<HtmlInlineElement>) {
  const access = useInlineSource(element);
  const source = useTextField(element, "html");
  const readOnly = access.readOnly || source.readOnly;
  const coarsePointer = usePluginEnvironment().input.coarsePointer;
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const attach = useCallback((node: HTMLInputElement | null) => { input.current = node; source.inputRef(node); }, [source.inputRef]);
  const css = useRuntimeCss(element.html, access.compiler);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const preview = <span data-tau-html-inline dangerouslySetInnerHTML={{ __html: element.html || "HTML" }} />;
  const editor = <Input ref={attach} defaultValue={source.value} readOnly={readOnly}
    onKeyDown={event => { event.stopPropagation(); if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); setOpen(false); } }}
    placeholder="输入 HTML" aria-label="行内 HTML 源码" />;
  return <span {...attributes} className="tau-html-inline">
    <InlineSourceBoundary />
    {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    {access.readOnly ? <span contentEditable={false}>{preview}</span> : coarsePointer ? <>
      <button type="button" contentEditable={false} className="tau-html-trigger" aria-label="编辑行内 HTML" onClick={() => setOpen(true)}>{preview}</button>
      <Dialog open={open} onOpenChange={setOpen} title="编辑行内 HTML" footer={<Button onClick={() => setOpen(false)}>完成</Button>}>
        <DialogBody><div onKeyDown={event => event.stopPropagation()} onBeforeInput={event => event.stopPropagation()} onInput={event => event.stopPropagation()} onPaste={event => event.stopPropagation()} onCut={event => event.stopPropagation()} onCopy={event => event.stopPropagation()}>{editor}{source.error && <p role="alert">{source.error}</p>}</div></DialogBody>
      </Dialog>
    </> : <Popover open={open} onOpenChange={setOpen} arrow={false} placement="bottom" className="tau-html-input" trigger={<span contentEditable={false} className="tau-html-trigger">{preview}</span>}>
      {editor}{source.error && <p role="alert">{source.error}</p>}
    </Popover>}
    <InlineSourceBoundary />{children}
  </span>;
}
