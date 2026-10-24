import type { EditorMetricRule } from "@tau/plugins";

export const editorMetrics = [
  {
    type: "html-block",
    textFields: ["html"],
  },
  {
    type: "html-inline",
    textFields: ["html"],
  },
] as const satisfies readonly EditorMetricRule[];
