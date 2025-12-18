import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  UserX, 
  Sparkles, 
  Calculator, 
  Image, 
  FileText, 
  GraduationCap,
  ArrowRight,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { categoryInfo, getToolsByCategory } from "@/lib/tools-data";

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  const categories = [
    { key: "calculators" as const, icon: Calculator, count: getToolsByCategory("calculators").length },
    { key: "image" as const, icon: Image, count: getToolsByCategory("image").length },
    { key: "pdf" as const, icon: FileText, count: getToolsByCategory("pdf").length },
    { key: "student" as const, icon: GraduationCap, count: getToolsByCategory("student").length },
    { key: "ai" as const, icon: Sparkles, count: getToolsByCategory("ai").length },
  ];

  const features = [
    { icon: Sparkles, title: "Free Forever", description: "All 39 tools completely free, no hidden costs" },
    { icon: UserX, title: "No Login Required", description: "Start using tools instantly, no account needed" },
    { icon: Zap, title: "Lightning Fast", description: "Browser-based processing, works offline" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <h1 className="text-2xl font-bold font-display">
              Stu<span className="text-primary">DENT</span>
            </h1>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Link href="/dashboard">
              <Button data-testid="button-header-open-tools">
                Open Tools
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-[80vh] flex items-center justify-center px-4 sm:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display mb-6 leading-tight">
              All Student Tools.{" "}
              <span className="text-primary">One Website.</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Your all-in-one productivity platform with 39 free tools for school and college students. 
              No login, no subscription, just tools that work.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-8 text-base" data-testid="button-hero-open-tools">
                  Open Tools
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base" data-testid="button-hero-browse">
                  Browse All 39 Tools
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">Why Choose StuDENT?</h3>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Built specifically for students who need reliable, fast, and free tools for everyday tasks.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="text-center" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <CardContent className="pt-8 pb-6">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-4">Browse by Category</h3>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              39 tools organized into 5 categories to help you find exactly what you need.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {categories.map((cat) => {
                const info = categoryInfo[cat.key];
                const Icon = cat.icon;
                return (
                  <Link key={cat.key} href="/dashboard">
                    <Card 
                      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                      data-testid={`card-category-${cat.key}`}
                    >
                      <CardContent className="pt-6 pb-4 text-center">
                        <div className={`w-14 h-14 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-4 text-white`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">{info.name}</h4>
                        <p className="text-sm text-muted-foreground">{cat.count} tools</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold font-display mb-4">
                Stu<span className="text-primary">DENT</span>
              </h4>
              <p className="text-muted-foreground text-sm">
                The ultimate productivity platform for students. 39 free tools to help you succeed in school and college.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} StuDENT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
