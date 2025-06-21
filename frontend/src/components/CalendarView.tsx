
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, List } from 'lucide-react';
import { Snapshot } from '@/utils/api';
import { format, isSameDay } from 'date-fns';

interface CalendarViewProps {
  snapshots: Snapshot[];
  onSnapshotSelect: (snapshot: Snapshot) => void;
  selectedSnapshots: string[];
  onSelectionChange: (selected: string[]) => void;
}

const CalendarView = ({ 
  snapshots, 
  onSnapshotSelect, 
  selectedSnapshots, 
  onSelectionChange 
}: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Group snapshots by date
  const snapshotsByDate = snapshots.reduce((acc, snapshot) => {
    const date = format(new Date(snapshot.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(snapshot);
    return acc;
  }, {} as Record<string, Snapshot[]>);

  // Get snapshots for selected date
  const selectedDateSnapshots = selectedDate 
    ? snapshotsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  // Create modifiers for calendar
  const datesWithSnapshots = Object.keys(snapshotsByDate).map(date => new Date(date));

  const handleSnapshotClick = (snapshot: Snapshot) => {
    onSnapshotSelect(snapshot);
  };

  const toggleSnapshotSelection = (timestamp: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelection = selectedSnapshots.includes(timestamp)
      ? selectedSnapshots.filter(t => t !== timestamp)
      : [...selectedSnapshots, timestamp];
    onSelectionChange(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Snapshot Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasSnapshots: datesWithSnapshots,
            }}
            modifiersStyles={{
              hasSnapshots: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold',
              },
            }}
            className="rounded-md border"
          />
          <div className="mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Dates with snapshots
            </div>
            <p>Total snapshots: {snapshots.length}</p>
            <p>Days with snapshots: {datesWithSnapshots.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Snapshots for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            {selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : 'Select a date'}
          </CardTitle>
          {selectedDateSnapshots.length > 0 && (
            <Badge variant="secondary">
              {selectedDateSnapshots.length} snapshot{selectedDateSnapshots.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {selectedDateSnapshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No snapshots found for this date</p>
              <p className="text-sm">Select a highlighted date to view snapshots</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDateSnapshots.map((snapshot) => (
                <div
                  key={snapshot.timestamp}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSnapshotClick(snapshot)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedSnapshots.includes(snapshot.timestamp)}
                          onChange={(e) => toggleSnapshotSelection(snapshot.timestamp, e as any)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <h4 className="font-medium truncate">
                          {snapshot.title || 'Untitled'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <span>{format(new Date(snapshot.timestamp), 'HH:mm:ss')}</span>
                        {snapshot.size && <Badge variant="outline">{snapshot.size}</Badge>}
                      </div>
                      <Badge className={getStatusColor(snapshot.status)}>
                        {snapshot.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
