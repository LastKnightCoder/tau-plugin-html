import { useEffect, useState } from "react";
import type { PluginRuntimeStyleCompiler } from "@tau/plugins";

export function useRuntimeCss(
  source: string,
  compiler?: PluginRuntimeStyleCompiler,
) {
  const [css, setCss] = useState("");
  useEffect(() => {
    let cancelled = false;
    setCss("");
    if (source.trim() && compiler) {
      void compiler.compile({ source: source.trim(), language: "html" }).then(
        (result) => {
          if (!cancelled) setCss(result);
        },
        () => {
          if (!cancelled) setCss("");
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [source, compiler]);
  return css;
}
