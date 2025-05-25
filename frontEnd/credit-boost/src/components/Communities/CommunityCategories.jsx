import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Home, 
  GraduationCap, 
  Briefcase, 
  LineChart, 
  Heart 
} from 'lucide-react';

// Financial community categories
const categories = [
  { id: 'trending', name: 'Trending', icon: TrendingUp },
  { id: 'credit-score', name: 'Credit Score', icon: CreditCard },
  { id: 'budgeting', name: 'Budgeting', icon: DollarSign },
  { id: 'saving', name: 'Saving', icon: PiggyBank },
  { id: 'investing', name: 'Investing', icon: LineChart },
  { id: 'debt', name: 'Debt Management', icon: CreditCard },
  { id: 'housing', name: 'Housing', icon: Home },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'career', name: 'Career & Income', icon: Briefcase },
  { id: 'retirement', name: 'Retirement', icon: Heart },
];

/**
 * Community Categories Component
 * Horizontal scrollable list of financial categories
 */
const CommunityCategories = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                className={`flex items-center gap-2 rounded-full px-4 py-2 ${
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-background'
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CommunityCategories;