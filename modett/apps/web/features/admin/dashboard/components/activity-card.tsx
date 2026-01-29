import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ShoppingBag, Users, Clock } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "order" | "user";
  description: string;
  timestamp: string;
  referenceId?: string;
}

interface ActivityCardProps {
  activities: ActivityItem[];
}

export function ActivityCard({ activities }: ActivityCardProps) {
  return (
    <Card className="border-[#BBA496]/30">
      <CardHeader className="border-b border-[#BBA496]/20 bg-white">
        <CardTitle
          className="text-lg font-medium text-[#232D35]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[#BBA496]/20">
          {activities && activities.length > 0 ? (
            activities.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start gap-4 hover:bg-[#F8F5F2] transition-colors cursor-pointer group"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === "order"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {item.type === "order" ? (
                    <ShoppingBag className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm text-[#232D35] font-medium"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {item.description}
                  </p>
                  <p
                    className="text-xs text-[#8B7355] mt-1"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#BBA496] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-[#BBA496] mx-auto mb-3" />
              <p
                className="text-sm text-[#8B7355]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                No recent activity
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
