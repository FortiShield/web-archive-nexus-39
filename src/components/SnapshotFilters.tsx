
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface SnapshotFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  status?: string;
  size?: string;
  dateRange?: { from: Date | null; to: Date | null };
  searchContent?: string;
}

const SnapshotFilters = ({ onFiltersChange, currentFilters }: SnapshotFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>(
    currentFilters.dateRange || { from: null, to: null }
  );

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    onFiltersChange({ ...currentFilters, ...newFilters });
  };

  const clearFilters = () => {
    setDateRange({ from: null, to: null });
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select 
              value={currentFilters.status || ''} 
              onValueChange={(value) => updateFilters({ status: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Size Range</label>
            <Select 
              value={currentFilters.size || ''} 
              onValueChange={(value) => updateFilters({ size: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sizes</SelectItem>
                <SelectItem value="small">Small (&lt; 1MB)</SelectItem>
                <SelectItem value="medium">Medium (1-5MB)</SelectItem>
                <SelectItem value="large">Large (&gt; 5MB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateRange.from ? format(dateRange.from, 'MMM dd, yyyy') : 'From date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from || undefined}
                    onSelect={(date) => {
                      const newRange = { ...dateRange, from: date || null };
                      setDateRange(newRange);
                      updateFilters({ dateRange: newRange });
                    }}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateRange.to ? format(dateRange.to, 'MMM dd, yyyy') : 'To date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to || undefined}
                    onSelect={(date) => {
                      const newRange = { ...dateRange, to: date || null };
                      setDateRange(newRange);
                      updateFilters({ dateRange: newRange });
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Content Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search Content</label>
            <Input
              placeholder="Search within archived content..."
              value={currentFilters.searchContent || ''}
              onChange={(e) => updateFilters({ searchContent: e.target.value || undefined })}
            />
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <div className="text-sm font-medium mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-1">
                {currentFilters.status && (
                  <Badge variant="secondary">Status: {currentFilters.status}</Badge>
                )}
                {currentFilters.size && (
                  <Badge variant="secondary">Size: {currentFilters.size}</Badge>
                )}
                {currentFilters.dateRange?.from && (
                  <Badge variant="secondary">
                    From: {format(currentFilters.dateRange.from, 'MMM dd')}
                  </Badge>
                )}
                {currentFilters.dateRange?.to && (
                  <Badge variant="secondary">
                    To: {format(currentFilters.dateRange.to, 'MMM dd')}
                  </Badge>
                )}
                {currentFilters.searchContent && (
                  <Badge variant="secondary">Search: {currentFilters.searchContent}</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SnapshotFilters;
