import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      content: "AI.Pro transformed our business operations completely. The automation features saved us 40 hours per week, and the insights we get are incredible.",
      author: "Sarah Chen",
      role: "CTO",
      company: "TechCorp",
      rating: 5,
      avatar: "SC"
    },
    {
      content: "The ease of integration was amazing. We had our AI models up and running in production within days, not months. Exceptional platform!",
      author: "Marcus Rodriguez",
      role: "Lead Developer",
      company: "InnovateLab",
      rating: 5,
      avatar: "MR"
    },
    {
      content: "Security was our biggest concern, but AI.Pro exceeded all our compliance requirements. Now we can focus on innovation, not infrastructure.",
      author: "Emily Watson",
      role: "Head of Security",
      company: "FinanceFlow",
      rating: 5,
      avatar: "EW"
    }
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Loved by{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Developers
            </span>{" "}
            Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See what industry leaders are saying about our platform and how it's 
            transforming their businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-card/30 backdrop-blur-sm border-border/50 hover:shadow-card transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Rating Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>
                
                {/* Testimonial Content */}
                <blockquote className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                {/* Author Info */}
                <div className="flex items-center">
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarImage src="" alt={testimonial.author} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;