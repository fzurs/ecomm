export function DataTableToolbar<TData>({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-2 px-4 lg:px-6 justify-between">{children}</div>
  );
}

export function DataTableToolbarFilters({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div className="flex flex-1 md:flex-wrap gap-2">{children}</div>;
}

export function DataTableToolbarControls({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap-reverse justify-end h-fit gap-2">
      {children}
    </div>
  );
}
