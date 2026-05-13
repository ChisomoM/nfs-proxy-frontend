import * as React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SortDirection } from "@/hooks/useTableSort";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Convert vertical wheel to horizontal scroll for better desktop UX
    const onWheel = (e: WheelEvent) => {
      // only hijack when there's horizontal overflow
      if (el.scrollWidth > el.clientWidth && Math.abs(e.deltaY) > 0) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <div className="relative w-full overflow-auto">
      <div 
        ref={containerRef}
        className="relative w-full"
      >
        <table
          ref={ref}
          className={cn(
            "min-w-full table-auto caption-bottom text-sm",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-50 font-medium font-sans text-text-sm text-gray-600 [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

// For rows that do not have hover effect
const TableHeaderRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-gray-100 bg-white",
      className
    )}
    {...props}
  />
));
TableHeaderRow.displayName = "TableHeaderRow";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-gray-100 transition-colors hover:bg-gray-50 data-[state=selected]:bg-gp-cobalt/5",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-11 sticky top-0 bg-white text-gray-400 align-middle font-sans font-medium text-text-xs uppercase tracking-wider px-3 lg:px-4 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "align-middle px-3 py-3 lg:px-4 lg:py-4 [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortKey: string;
  sortColumn: string | null;
  sortDirection: SortDirection;
  onSort: (key: string) => void;
}

const SortableTableHead = React.forwardRef<HTMLTableCellElement, SortableTableHeadProps>(
  ({ sortKey, sortColumn, sortDirection, onSort, children, className, ...props }, ref) => {
    const isActive = sortColumn === sortKey;
    const Icon = isActive
      ? sortDirection === 'asc' ? ArrowUp : ArrowDown
      : ArrowUpDown;

    return (
      <th
        ref={ref}
        onClick={() => onSort(sortKey)}
        aria-sort={isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={cn(
          "h-11 sticky top-0 bg-white align-middle font-sans font-medium text-text-xs uppercase tracking-wider px-3 lg:px-4 cursor-pointer select-none group/th transition-colors duration-100 hover:bg-gray-50",
          isActive ? "text-gp-cobalt" : "text-gray-400",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-1.5">
          {children}
          <span
            className={cn(
              "inline-flex items-center justify-center w-[18px] h-[18px] rounded-md flex-shrink-0 transition-all duration-150",
              isActive
                ? "bg-gp-cobalt/10 text-gp-cobalt"
                : "text-gray-300 group-hover/th:text-gray-500 group-hover/th:bg-gray-100"
            )}
          >
            <Icon size={11} />
          </span>
        </div>
      </th>
    );
  }
);
SortableTableHead.displayName = "SortableTableHead";

export {
  Table,
  TableHeader,
  TableHeaderRow,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  SortableTableHead,
};

// BaseEntity generic type with id field
interface BaseEntity {
  id: string | number;
}

export type TableAction = "edit" | "delete" | "view";

export interface TableConfig<T extends BaseEntity = any> {
  items: T[];
  onSelect: (action: TableAction, selected: T, index: number) => void;
  onCustomAction?: (
    action: string,
    selected: T,
    index: number,
    payload?: Record<string, unknown>
  ) => void;
}
