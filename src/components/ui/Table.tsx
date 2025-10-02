'use client';

import { ReactNode } from 'react';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
}

interface TableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  renderCell?: (column: TableColumn, item: Record<string, unknown>, index: number) => ReactNode;
  onRowClick?: (item: Record<string, unknown>, index: number) => void;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  className?: string;
}

export default function Table({ 
  columns, 
  data, 
  renderCell, 
  onRowClick, 
  emptyMessage = "No data available",
  emptyIcon,
  className = ""
}: TableProps) {
  const defaultRenderCell = (column: TableColumn, item: Record<string, unknown>): ReactNode => {
    return item[column.key] as ReactNode;
  };

  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-border overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--light-gray)]">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-[var(--navy)] uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={index}
                  className={`hover:bg-[var(--light-gray)]/50 transition-all duration-300 ${
                    onRowClick ? 'cursor-pointer hover:shadow-sm' : ''
                  } ${index % 2 === 0 ? 'bg-card' : 'bg-[var(--light-gray)]/20'}`}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-foreground ${column.className || ''}`}
                    >
                      {cellRenderer(column, item, index)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    {emptyIcon}
                    <h3 className="text-lg font-medium text-foreground mb-2 font-serif">No data found</h3>
                    <p className="text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
