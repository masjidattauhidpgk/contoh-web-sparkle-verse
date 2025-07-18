import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Brain, Shield, Zap, Layers, Globe, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Advanced AI Models",
      description: "Leverage cutting-edge machine learning algorithms to solve complex business problems with unprecedented accuracy."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process thousands of requests per second with our optimized infrastructure and intelligent caching systems."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption, SOC 2 compliance, and advanced threat protection."
    },
    {
      icon: Layers,
      title: "Seamless Integration",
      description: "Connect with your existing tools and workflows through our comprehensive REST API and SDK libraries."
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Deploy anywhere in the world with our distributed cloud infrastructure and edge computing capabilities."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor performance, track usage, and gain insights with our powerful analytics and reporting dashboard."
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to build, deploy, and scale AI-powered applications 
            that drive real business results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-card hover:shadow-glow/20 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:animate-glow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;