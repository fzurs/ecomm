import { cn } from "cn"
import Markdown from "react-markdown"
import remarkGfm from "remark-gfm"

// No typography plugin in the repo: the few elements the assistant writes
// (paragraphs, lists, tables, bold, code) are styled here.
export function AssistantMarkdown({ children }: { children: string }) {
  return (
    <div
      className={cn(
        "space-y-2 break-words",
        "[&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_a]:underline [&_strong]:font-semibold",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-xs",
        "[&_table]:w-full [&_table]:text-xs [&_td]:border-b [&_td]:py-1 [&_td:not(:last-child)]:pr-2 [&_th]:border-b [&_th]:py-1 [&_th]:text-left [&_th]:font-medium [&_th:not(:last-child)]:pr-2"
      )}
    >
      <Markdown remarkPlugins={[remarkGfm]}>{children}</Markdown>
    </div>
  )
}
