import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { HtmlInline } from "../editor/HtmlInline";

const state = vi.hoisted(() => ({
  readOnly: false,
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("@tau/plugins", () => ({
  useInlineSource: () => state,
  InlineSourceBoundary: () => <span />,
}));
vi.mock("@tau/ui", () => ({
  Input: (props: any) => <input {...props} />,
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
      <HtmlInline
        attributes={{} as any}
        element={{
          type: "html-inline",
          html: "<b>原文</b>",
          openEdit,
          children: [{ type: "formatted", text: "" }],
        }}
      >
        <span />
      </HtmlInline>,
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
