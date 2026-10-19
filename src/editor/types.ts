export interface HtmlBlockElement {
  type: "html-block";
  html: string;
  children: { type: "formatted"; text: string }[];
}
export interface HtmlInlineElement {
  type: "html-inline";
  html: string;
  openEdit?: boolean;
  children: { type: "formatted"; text: string }[];
}
declare module "@tau/plugins" {
  interface EditorElementMap {
    "html-block": HtmlBlockElement;
    "html-inline": HtmlInlineElement;
  }
  interface EditorInlineElementMap {
    "html-inline": HtmlInlineElement;
  }
}
