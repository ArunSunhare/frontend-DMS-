import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  buttonText: string;
  variant: "default" | "card" | "admin";
  onClick: () => void;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  buttonText,
  variant,
  onClick,
}: FeatureCardProps) {
  return (
    <Card className="h-full shadow-card-glow hover:shadow-hover-lift transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold text-card-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
        <Button 
     
          size="lg" 
          onClick={onClick}
          className="w-full"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}