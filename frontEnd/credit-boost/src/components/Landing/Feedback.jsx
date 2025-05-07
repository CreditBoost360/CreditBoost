import { useState } from 'react';
import { Star } from 'lucide-react';
import Container from '../Common/Container';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Small Business Owner",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "CreditBoost transformed how I manage my business credit. The AI recommendations were spot-on!",
    company: "Green Earth Foods"
  },
  {
    name: "Michael Rodriguez",
    role: "Startup Founder",
    avatar: "/api/placeholder/100/100",
    rating: 5,
    content: "Within 6 months, our credit score improved significantly. The platform's guidance was invaluable.",
    company: "TechStart Solutions"
  },
  {
    name: "Priya Patel",
    role: "Finance Director",
    avatar: "/api/placeholder/100/100",
    rating: 4,
    content: "The real-time monitoring and actionable insights helped us maintain a healthy credit profile.",
    company: "Artisan Crafts Co."
  }
];

export default function Feedback() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div id="reviews" className="py-16 bg-gray-50 dark:bg-gray-900">
      <Container>
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">
            Success Stories
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Join thousands of satisfied MSMEs who've improved their credit scores
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`relative p-6 rounded-2xl transition-all duration-300 interactive-element touch-feedback ${
                idx === activeIndex
                  ? 'bg-white dark:bg-gray-800 shadow-xl scale-105'
                  : 'bg-white/50 dark:bg-gray-800/50 shadow hover:shadow-xl cursor-pointer'
              }`}
              onClick={() => setActiveIndex(idx)}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < testimonial.rating ? 'fill-sky-500 text-sky-500' : 'text-gray-300'}
                  />
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {testimonial.content}
              </p>
              
              <p className="text-sm font-medium text-sky-500">
                {testimonial.company}
              </p>
              
              {idx === activeIndex && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6">
                  <div className="w-3 h-3 bg-sky-500 rotate-45 mx-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}