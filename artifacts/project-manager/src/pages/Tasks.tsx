import { useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Tasks() {
  const { data: tasks, isLoading } = useListTasks({}, { query: { queryKey: getListTasksQueryKey() } });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
      <div className="space-y-2">
        {tasks?.map(task => (
          <Card key={task.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{task.title}</h3>
                {task.projectName && <Badge variant="secondary" className="text-xs">{task.projectName}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{task.priority}</Badge>
              <Badge>{task.status}</Badge>
            </div>
          </Card>
        ))}
        {tasks?.length === 0 && (
          <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
            No tasks found.
          </div>
        )}
      </div>
    </div>
  );
}
