import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HtmlInline } from "../editor/HtmlInline";

const state = vi.hoisted(() => ({
  readOnly: false,
  coarsePointer: false,
  outerKeyDown: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  input: vi.fn(),
}));
vi.mock("@tau/plugins", () => ({
  useInlineSource: () => state,
  useTextField: () => ({ value: "<b>原文</b>", readOnly: state.readOnly, ready: true, error: null, inputRef: (input: HTMLInputElement | null) => { if (input) input.oninput = () => state.input(input.value); } }),
  usePluginEnvironment: () => ({ input: { coarsePointer: state.coarsePointer } }),
  InlineSourceBoundary: () => <span />,
}));
vi.mock("@tau/ui", () => ({
  Input: (props: any) => <input {...props} />,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  DialogBody: ({ children }: any) => <div>{children}</div>,
  Dialog: ({ open, children, footer, onOpenChange }: any) => open && <div>{children}{footer}<button onClick={() => onOpenChange(false)}>关闭</button></div>,
  Popover: ({ open, trigger, children, onOpenChange }: any) => (
    <div>
      <button onClick={() => onOpenChange(!open)}>{trigger}</button>
      {open && children}
    </div>
  ),
}));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
async function show(openEdit = true) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root.render(
      <div onKeyDown={state.outerKeyDown}><HtmlInline
        attributes={{} as any}
        element={{
          type: "html-inline",
          html: "<b>原文</b>",
          openEdit,
          children: [{ type: "formatted", text: "" }],
        }}
      >
        <span />
      </HtmlInline></div>,
    ),
  );
  if (!state.readOnly) await act(async () => host.querySelector("button")?.click());
}
async function input(value: string) {
  await act(async () => {
    const target = host.querySelector("input")!;
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(target, value);
    target.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function enter() {
  await act(async () =>
    host
      .querySelector("input")!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      ),
  );
}
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  state.readOnly = false;
  state.coarsePointer = false;
  vi.clearAllMocks();
});
it("只读内容忽略 openEdit，不能打开编辑或回写", async () => {
  state.readOnly = true;
  await show();
  expect(host.querySelector("b")?.textContent).toBe("原文");
  expect(host.querySelector("input")).toBeNull();
  expect(host.querySelector("button")).toBeNull();
  expect(state.update).not.toHaveBeenCalled();
  expect(state.remove).not.toHaveBeenCalled();
});
it("输入立即交给字段绑定，Enter 只关闭，不整段回写节点", async () => {
  await show(); await input(" <i>修改</i> ");
  expect(state.input).toHaveBeenCalledWith(" <i>修改</i> ");
  await enter();
  expect(state.update).not.toHaveBeenCalled(); expect(state.remove).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBeNull();
});
it("空白字段保留节点，关闭不会误删远端内容", async () => {
  await show(); await input("  "); await enter();
  expect(state.input).toHaveBeenCalledWith("  ");
  expect(state.remove).not.toHaveBeenCalled();
});
it("触摸编辑完成只退出浮层，输入事件不冒泡到正文", async () => {
  state.coarsePointer = true; await show(); await input("<i>已同步</i>");
  const done = [...host.querySelectorAll("button")].find(button => button.textContent === "完成")!;
  await act(async () => done.click());
  expect(state.input).toHaveBeenCalledWith("<i>已同步</i>");
  expect(state.outerKeyDown).not.toHaveBeenCalled();
  expect(state.update).not.toHaveBeenCalled(); expect(state.remove).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBeNull();
});
