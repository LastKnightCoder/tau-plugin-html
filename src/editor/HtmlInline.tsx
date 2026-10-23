import { useEffect, useRef, useState } from "react";
import {
  InlineSourceBoundary,
  useInlineSource,
  usePluginEnvironment,
  type EditorElementRenderProps,
} from "@tau/plugins";
import { Button, Dialog, DialogBody, Input, Popover } from "@tau/ui";
import { useRuntimeCss } from "../render/useRuntimeCss";
import type { HtmlInlineElement } from "./types";

export function HtmlInline({
  attributes,
  children,
  element,
}: EditorElementRenderProps<HtmlInlineElement>) {
  const { readOnly, update, remove, compiler } = useInlineSource(element);
  const coarsePointer = usePluginEnvironment().input.coarsePointer;
  const [draft, setDraft] = useState(element.html);
  const [open, setOpen] = useState(!readOnly && !!element.openEdit);
  const input = useRef<HTMLInputElement>(null);
  const css = useRuntimeCss(open ? draft : element.html, compiler);
  useEffect(() => {
    setOpen(!readOnly && !!element.openEdit);
    setDraft(element.html);
  }, [readOnly, element.html, element.openEdit]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);
  const close = () => {
    if (!readOnly) {
      if (!draft.trim()) remove();
      else if (draft !== element.html || element.openEdit)
        update({ html: draft, openEdit: false });
    }
    setOpen(false);
  };
  const cancel = () => {
    setDraft(element.html);
    setOpen(false);
    if (!readOnly && element.openEdit) update({ openEdit: false });
  };
  const preview = (
    <span
      data-tau-html-inline
      dangerouslySetInnerHTML={{
        __html: (open ? draft : element.html) || "HTML",
      }}
    />
  );
  return (
    <span {...attributes} className="tau-html-inline">
      <InlineSourceBoundary />
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {readOnly ? (
        <span contentEditable={false}>{preview}</span>
      ) : coarsePointer ? (
        <>
          <button type="button" contentEditable={false} className="tau-html-trigger" aria-label="编辑行内 HTML" onClick={() => { setDraft(element.html); setOpen(true); }}>
            {preview}
          </button>
          <Dialog open={open} onOpenChange={visible => !visible && cancel()} title="编辑行内 HTML" footer={<><Button variant="secondary" onClick={cancel}>取消</Button><Button onClick={close}>保存</Button></>}>
            <DialogBody>
              <div onKeyDown={event => event.stopPropagation()} onBeforeInput={event => event.stopPropagation()} onInput={event => event.stopPropagation()} onPaste={event => event.stopPropagation()} onCut={event => event.stopPropagation()} onCopy={event => event.stopPropagation()}>
                <Input ref={input} value={draft} onChange={event => setDraft(event.target.value)} aria-label="行内 HTML 源码" placeholder="输入 HTML" />
              </div>
            </DialogBody>
          </Dialog>
        </>
      ) : (
        <Popover
          open={open}
          onOpenChange={(visible) => {
            if (visible) {
              setDraft(element.html);
              setOpen(true);
            } else close();
          }}
          arrow={false}
          placement="bottom"
          className="tau-html-input"
          trigger={
            <span contentEditable={false} className="tau-html-trigger">
              {preview}
            </span>
          }
        >
          <Input
            ref={input}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                close();
              }
            }}
            placeholder="输入HTML, Esc/回车确认"
            aria-label="行内 HTML 源码"
          />
        </Popover>
      )}
      <InlineSourceBoundary />
      {children}
    </span>
  );
}
