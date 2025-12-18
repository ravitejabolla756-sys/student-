import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tool, categoryInfo } from "@/lib/tools-data";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const category = categoryInfo[tool.category];
  const Icon = tool.icon;

  return (
    <Link href={tool.path}>
      <Card 
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border border-border h-full"
        data-testid={`card-tool-${tool.id}`}
      >
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs shrink-0"
              data-testid={`badge-category-${tool.id}`}
            >
              {category.name}
            </Badge>
          </div>
          
          <h3 
            className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors"
            data-testid={`text-tool-name-${tool.id}`}
          >
            {tool.name}
          </h3>
          
          <p 
            className="text-muted-foreground text-sm line-clamp-2 flex-1"
            data-testid={`text-tool-description-${tool.id}`}
          >
            {tool.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
