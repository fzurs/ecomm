import { notFound } from "next/navigation"

// The playground is a development tool: it 404s in any other environment.
export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (process.env.NODE_ENV !== "development") notFound()

  return children
}
