import { ToolCard } from "./tool-card";
import { Tool, categoryInfo, ToolCategory } from "@/lib/tools-data";

interface CategorySectionProps {
  category: ToolCategory;
  tools: Tool[];
}

export function CategorySection({ category, tools }: CategorySectionProps) {
  const info = categoryInfo[category];
  const Icon = info.icon;

  return (
    <section className="mb-12" data-testid={`section-category-${category}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-semibold">
          {info.name}
          <span className="text-muted-foreground font-normal ml-2">({tools.length})</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}
