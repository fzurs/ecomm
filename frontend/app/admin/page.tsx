import { SiteHeader } from "@/components/site-header";

export default function Page() {
  return (
    <>
      <SiteHeader title="Admin" />
      <div className="flex flex-col w-full max-w-3xl p-4 md:p-6 mx-auto">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
          Welcome to Admin
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-muted-foreground">
          This is your online store's administration panel. Here you
          can view and edit your products, orders, and customers.
        </p>
      </div>
    </>
  );
}
