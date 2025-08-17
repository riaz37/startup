import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Testimonial } from "@/types";

const testimonials: Testimonial[] = [
  {
    name: "Sarah Ahmed",
    role: "Home Chef",
    initials: "SA",
    content: "Sohozdaam has transformed how I stock my kitchen. The group ordering feature saves me money every month, and the quality is consistently excellent.",
    rating: 5
  },
  {
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    initials: "RK",
    content: "As a restaurant owner, I need reliable suppliers. Sohozdaam's bulk pricing and on-time delivery have made a huge difference to my bottom line.",
    rating: 5
  },
  {
    name: "Priya Sharma",
    role: "Catering Business",
    initials: "PS",
    content: "The variety of products and competitive prices have helped me expand my catering menu. Customer service is outstanding too!",
    rating: 5
  },
  {
    name: "Amit Patel",
    role: "Food Truck Owner",
    initials: "AP",
    content: "Running a food truck means I need quality ingredients at the best prices. Sohozdaam delivers both, every single time.",
    rating: 4
  },
  {
    name: "Fatima Khan",
    role: "Event Planner",
    initials: "FK",
    content: "Planning large events requires bulk orders, and Sohozdaam makes it easy and affordable. Highly recommended!",
    rating: 5
  },
  {
    name: "Vikram Singh",
    role: "Café Manager",
    initials: "VS",
    content: "The group ordering system is brilliant. We've cut our ingredient costs by 25% while maintaining the same quality standards.",
    rating: 5
  }
];

export function TestimonialsSection() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-muted/50 dark:bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Sohozdaam for their bulk food ingredient needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {renderStars(testimonial.rating)}
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
