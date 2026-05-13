import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";
import type { ButtonProps } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};

// Pagination exported from Providers: moved here to keep code succint - put together
export function Paginator({
  onNext = () => {},
  onPrev = () => {},
  pages = 1,
  goTo = () => {},
  currentPage = 1,
}: PropsWithChildren<{
  onNext?: () => void;
  onPrev?: () => void;
  pages?: number;
  goTo?: (page: number) => void;
  currentPage?: number;
}>) {
  const pageNumbers = useMemo(() => {
    if (pages <= 7) {
      return Array(pages)
        .fill(null)
        .map((_, idx) => ({ type: "number", value: idx + 1 }));
    } else if (currentPage <= 3) {
      return [
        ...Array(5)
          .fill(null)
          .map((_, idx) => ({ type: "number", value: idx + 1 })),
        { type: "ellipsis", value: null },
        { type: "number", value: pages },
      ];
    } else if (pages - currentPage <= 3) {
      return [
        { type: "number", value: 1 },
        { type: "ellipsis", value: null },
        ...Array(5)
          .fill(null)
          .map((_, idx) => ({
            type: "number",
            value: pages - 4 + idx,
          })),
      ];
    }

    return [
      { type: "number", value: 1 },
      { type: "ellipsis", value: null },
      { type: "number", value: currentPage - 1 },
      { type: "number", value: currentPage },
      { type: "number", value: currentPage + 1 },
      { type: "ellipsis", value: null },
      { type: "number", value: pages },
    ];
  }, [currentPage, pages]);

  if (pages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem onClick={() => currentPage > 1 && onPrev()}>
          <PaginationPrevious />
        </PaginationItem>

        {pageNumbers.map((item, index) =>
          item.type === "number" ? (
            <PaginationItem
              key={index}
              className="hidden md:block"
              onClick={() => goTo(item.value as number)}
            >
              <PaginationLink isActive={item.value === currentPage}>
                {item.value}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={index} className="hidden md:block">
              <PaginationEllipsis />
            </PaginationItem>
          )
        )}

        <PaginationItem onClick={() => currentPage < pages && onNext()}>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
