import { useListMembers, getListMembersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Team() {
  const { data: members, isLoading } = useListMembers({ query: { queryKey: getListMembersQueryKey() } });

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.map(member => (
          <Card key={member.id}>
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{member.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
