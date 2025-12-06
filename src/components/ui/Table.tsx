import React, { ReactNode } from 'react'
import { cn } from '@lib/utils'
import Button from './Button'

// Spinner component
function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  
  return (
    <div className={cn('animate-spin rounded-full border-2 border-gray-300 border-t-femme-magenta', sizeClass)} />
  )
}

// Column definition interface
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  width?: string
  sortable?: boolean
  render?: (item: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
}

// Table props interface
export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  className?: string
  
  // Pagination
  pagination?: {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    onPageChange: (page: number) => void
    showInfo?: boolean
  }
  
  // Sorting
  sorting?: {
    key: keyof T | string | null
    direction: 'asc' | 'desc'
    onSort: (key: keyof T | string) => void
  }
  
  // Empty state
  emptyState?: {
    title?: string
    description?: string
    action?: ReactNode
  }
  
  // Row actions
  onRowClick?: (item: T, index: number) => void
  rowClassName?: (item: T, index: number) => string
  
  // Loading state customization
  loadingRows?: number
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  className,
  pagination,
  sorting,
  emptyState,
  onRowClick,
  rowClassName,
  loadingRows = 5
}: TableProps<T>) {
  
  // Render sort indicator
  const renderSortIcon = (columnKey: keyof T | string) => {
    if (!sorting || sorting.key !== columnKey) {
      return <span className="text-gray-400 ml-1">⇅</span>
    }
    
    return (
      <span className="ml-1 text-femme-magenta">
        {sorting.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }
  
  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <tbody>
      {Array.from({ length: loadingRows }).map((_, index) => (
        <tr key={`loading-${index}`} className="border-b">
          {columns.map((column, colIndex) => (
            <td key={`loading-${index}-${colIndex}`} className="px-3 py-4">
              <div className="bg-gray-200 rounded animate-pulse h-4 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
  
  // Render empty state
  const renderEmptyState = () => (
    <tbody>
      <tr>
        <td colSpan={columns.length} className="px-3 py-16 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="text-gray-400">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3.5M4 13h3.5" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {emptyState?.title || 'No hay datos'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {emptyState?.description || 'No se encontraron elementos para mostrar.'}
              </p>
            </div>
            {emptyState?.action && (
              <div className="mt-4">
                {emptyState.action}
              </div>
            )}
          </div>
        </td>
      </tr>
    </tbody>
  )
  
  // Render pagination
  const renderPagination = () => {
    if (!pagination) return null
    
    const { currentPage, totalPages, pageSize, totalItems, onPageChange, showInfo = true } = pagination
    
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        {showInfo && (
          <div className="flex-1 flex justify-between sm:hidden">
            <span className="text-sm text-gray-700">
              {startItem} - {endItem} de {totalItems}
            </span>
          </div>
        )}
        
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          {showInfo && (
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startItem}</span> a{' '}
                <span className="font-medium">{endItem}</span> de{' '}
                <span className="font-medium">{totalItems}</span> resultados
              </p>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md border',
                      pageNum === currentPage
                        ? 'bg-femme-magenta text-white border-femme-magenta'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn('bg-white shadow-sm rounded-lg border', className)}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2">
            <Spinner size="md" />
            <span className="text-sm text-gray-600">Cargando datos...</span>
          </div>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-700">
                {columns.map((column, index) => (
                  <th
                    key={String(column.key) || index}
                    className={cn(
                      'px-3 py-3 font-medium',
                      column.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                    onClick={() => {
                      if (column.sortable && sorting) {
                        sorting.onSort(column.key)
                      }
                    }}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            {loading ? renderLoadingSkeleton() : (
              <>
                {data.length === 0 ? renderEmptyState() : (
                  <tbody>
                    {data.map((item, index) => (
                      <tr
                        key={item.id || index}
                        className={cn(
                          'border-b last:border-0 hover:bg-gray-50 transition-colors',
                          onRowClick && 'cursor-pointer',
                          rowClassName?.(item, index)
                        )}
                        onClick={() => onRowClick?.(item, index)}
                      >
                        {columns.map((column, colIndex) => (
                          <td
                            key={String(column.key) || colIndex}
                            className={cn('px-3 py-3', column.className)}
                          >
                            {column.render
                              ? column.render(item, index)
                              : String(item[column.key as keyof T] || '-')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}
              </>
            )}
          </table>
        </div>
        
        {pagination && renderPagination()}
      </div>
    </div>
  )
}

// Export additional types and components
export { Spinner }
