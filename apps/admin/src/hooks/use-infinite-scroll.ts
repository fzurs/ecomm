import * as React from "react";

export function useInfiniteScroll(
  hasNextPage: boolean,
  fetchNextPage: () => void,
) {
  return React.useCallback(
    (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
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
}
