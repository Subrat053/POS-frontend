import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto rounded-lg border border-border bg-card">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-secondary/50 border-b border-border [&_tr]:border-b-0", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableFooter({ className, ...props }) {
  return <tfoot className={cn("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />;
}

export function TableRow({ className, selected, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
        selected && "bg-muted/70",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left align-middle font-semibold text-muted-foreground [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:pl-4",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:pl-4 text-foreground",
        className
      )}
      {...props}
    />
  );
}
