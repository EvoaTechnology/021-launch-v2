/**
 * Report template and instruction builder.
 * Adjust the tags/sections here to control the final structure.
 */
export function getReportInstructionAndTemplate(): {
  instruction: string;
  template: string;
} {
  const template = `
<REPORT>
<TITLE></TITLE>
<SUMMARY></SUMMARY>
<USER_INTENT></USER_INTENT>
<KEY_TOPICS></KEY_TOPICS>
<PAIN_POINTS></PAIN_POINTS>
<SUGGESTED_ACTIONS></SUGGESTED_ACTIONS>
<RISKS></RISKS>
<NEXT_STEPS></NEXT_STEPS>
</REPORT>`;

  const instruction = `
You are an expert analyst. From the user–assistant chat history, produce a structured report using the exact tags from the provided template. Do not add or remove tags. Fill in concise, actionable content. If content is unknown, leave a clear TODO placeholder. Avoid any text outside the report.`.trim();

  return { instruction, template };
}
