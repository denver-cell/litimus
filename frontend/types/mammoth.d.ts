// mammoth's browser entry point (mammoth/mammoth.browser, used for
// client-side .docx text extraction in components/Detector.tsx) ships no
// bundled TypeScript types, so `next build`'s type-check step fails
// without this declaration. Only the shape this app actually uses is
// declared here.
declare module "mammoth/mammoth.browser" {
  export function extractRawText(input: {
    arrayBuffer: ArrayBuffer;
  }): Promise<{ value: string; messages: any[] }>;

  const mammoth: {
    extractRawText: typeof extractRawText;
  };
  export default mammoth;
}
