import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, Users, Zap } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-primary-glow/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-primary/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Trusted by 10,000+ companies</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Build the Future with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            Solutions
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Transform your business with cutting-edge artificial intelligence. 
            Scale faster, work smarter, and stay ahead of the competition.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button variant="hero" size="lg" className="text-lg px-8 py-4">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="glass" size="lg" className="text-lg px-8 py-4">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary mr-2" />
                <span className="text-3xl font-bold">50K+</span>
              </div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-primary mr-2" />
                <span className="text-3xl font-bold">99.9%</span>
              </div>
              <p className="text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-primary mr-2" />
                <span className="text-3xl font-bold">4.9/5</span>
              </div>
              <p className="text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;