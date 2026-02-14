import * as React from "react";

export function useInfiniteScroll({
  hasNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const onScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      if (
        hasNextPage &&
        target.scrollTop + target.clientHeight >= target.scrollHeight
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, fetchNextPage],
  );

  return onScroll;
}
