import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HtmlInline } from "../editor/HtmlInline";

const state = vi.hoisted(() => ({
  readOnly: false,
  touch: false,
  outerKeyDown: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@tau/plugins", () => ({
  useInlineSource: () => state,
  usePluginEnvironment: () => ({ input: { touch: state.touch } }),
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
  state.touch = false;
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
it("Enter 保存原始空白与 HTML，关闭 openEdit", async () => {
  await show();
  await input(" <i>修改</i> ");
  await enter();
  expect(state.update).toHaveBeenCalledWith({
    html: " <i>修改</i> ",
    openEdit: false,
  });
  expect(state.remove).not.toHaveBeenCalled();
});
it("空白输入确认后删除节点", async () => {
  await show();
  await input("  ");
  await enter();
  expect(state.remove).toHaveBeenCalledOnce();
  expect(state.update).not.toHaveBeenCalled();
});

it("触摸编辑取消不保存草稿，输入事件不冒泡到正文", async () => {
  state.touch = true;
  await show();
  await input("<i>未保存</i>");
  await enter();
  expect(state.outerKeyDown).not.toHaveBeenCalled();
  expect(state.update).not.toHaveBeenCalled();
  const cancel = [...host.querySelectorAll("button")].find(button => button.textContent === "取消")!;
  await act(async () => cancel.click());
  expect(state.update).toHaveBeenCalledWith({ openEdit: false });
  expect(state.remove).not.toHaveBeenCalled();
  expect(host.querySelector("input")).toBeNull();
});

it("触摸编辑通过明确保存按钮提交源码", async () => {
  state.touch = true;
  await show();
  await input(" <i>手机保存</i> ");
  const save = [...host.querySelectorAll("button")].find(button => button.textContent === "保存")!;
  await act(async () => save.click());
  expect(state.update).toHaveBeenCalledWith({ html: " <i>手机保存</i> ", openEdit: false });
});
