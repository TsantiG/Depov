import type React from "react"

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  striped?: boolean
  bordered?: boolean
  hover?: boolean
  small?: boolean
}

export function Table({
  children,
  className = "",
  striped = false,
  bordered = false,
  hover = false,
  small = false,
  ...props
}: TableProps) {
  const tableClass = `table ${striped ? "table-striped" : ""} ${bordered ? "table-bordered" : ""} ${hover ? "table-hover" : ""} ${small ? "table-sm" : ""} ${className}`

  return (
    <div className="table-responsive">
      <table className={tableClass} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  )
}

export function TableRow({ className = "", children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  )
}

export function TableCell({ className = "", children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={className} {...props}>
      {children}
    </td>
  )
}

export function TableHeader({ className = "", children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={className} {...props}>
      {children}
    </th>
  )
}

