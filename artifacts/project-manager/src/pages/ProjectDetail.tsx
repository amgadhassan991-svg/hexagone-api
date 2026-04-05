import { useRoute } from "wouter";
import { useGetProject, getGetProjectQueryKey, useListTasks, getListTasksQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const id = Number(params?.id);
  
  const { data: project, isLoading: loadingProject } = useGetProject(id, { query: { enabled: !!id, queryKey: getGetProjectQueryKey(id) } });
  const { data: tasks, isLoading: loadingTasks } = useListTasks({ projectId: id }, { query: { enabled: !!id, queryKey: getListTasksQueryKey({ projectId: id }) } });

  if (loadingProject || loadingTasks) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <Badge>{project.status}</Badge>
        </div>
        <p className="text-muted-foreground">{project.description}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <div className="space-y-2">
          {tasks?.map(task => (
            <Card key={task.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{task.priority}</Badge>
                  <Badge>{task.status}</Badge>
                </div>
              </div>
            </Card>
          ))}
          {tasks?.length === 0 && (
            <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No tasks yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
