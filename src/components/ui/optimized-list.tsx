/**
 * Optimized List Component
 * 
 * High-performance list component with virtualization, memoization, and lazy loading.
 */

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { VirtualizedList, useIntersectionObserver, useOptimizedList } from '@/utils/performance';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
  itemHeight?: number;
  virtualizeThreshold?: number;
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
  emptyStateComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  onLoadMore,
  hasMore = false,
  loading = false,
  className,
  itemHeight = 100,
  virtualizeThreshold = 100,
  filterFn,
  sortFn,
  emptyStateComponent,
  loadingComponent
}: OptimizedListProps<T>) {
  const [containerHeight, setContainerHeight] = useState(400);
  
  // Optimize items with filtering and sorting
  const optimizedItems = useOptimizedList(items, filterFn, sortFn);
  
  // Memoized empty state
  const emptyState = useMemo(() => {
    if (loading && optimizedItems.length === 0) {
      return loadingComponent || <ListSkeleton count={5} />;
    }
    
    if (optimizedItems.length === 0) {
      return emptyStateComponent || (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum item encontrado
        </div>
      );
    }
    
    return null;
  }, [loading, optimizedItems.length, loadingComponent, emptyStateComponent]);
  
  // Infinite scroll intersection observer
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (onLoadMore && hasMore && !loading) {
        onLoadMore();
      }
    }, [onLoadMore, hasMore, loading]),
    { threshold: 0.1 }
  );
  
  // Measure container height for virtualization
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setContainerHeight(node.clientHeight || 400);
    }
  }, []);
  
  // Memoized render function to prevent recreation
  const memoizedRenderItem = useCallback(
    (item: T, index: number) => {
      const key = keyExtractor(item, index);
      return (
        <div key={key} className="w-full">
          {renderItem(item, index)}
        </div>
      );
    },
    [renderItem, keyExtractor]
  );
  
  if (emptyState) {
    return <div className={cn('w-full', className)}>{emptyState}</div>;
  }
  
  // Use virtualization for large lists
  const shouldVirtualize = optimizedItems.length > virtualizeThreshold;
  
  return (
    <div className={cn('w-full', className)}>
      {shouldVirtualize ? (
        <div ref={containerRef} style={{ height: '400px' }}>
          <VirtualizedList
            items={optimizedItems}
            itemHeight={itemHeight}
            containerHeight={containerHeight}
            renderItem={memoizedRenderItem}
            keyExtractor={keyExtractor}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {optimizedItems.map(memoizedRenderItem)}
        </div>
      )}
      
      {/* Infinite scroll loader */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-4"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              Carregando mais...
            </div>
          ) : (
            <div className="h-8" /> // Trigger zone
          )}
        </div>
      )}
    </div>
  );
}

// Optimized skeleton loader
const ListSkeleton = React.memo(({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="p-4 border rounded-lg">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

ListSkeleton.displayName = 'ListSkeleton';

export { ListSkeleton };