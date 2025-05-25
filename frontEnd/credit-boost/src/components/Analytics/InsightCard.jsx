import React from 'react';
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * InsightCard component for displaying financial insights
 * 
 * @param {Object} props
 * @param {string} props.title - The title of the insight
 * @param {string} props.description - The detailed description of the insight
 * @param {string} props.type - The type of insight (positive, negative, neutral, warning)
 * @param {string} props.icon - The icon to display (optional)
 * @param {number} props.value - The value associated with the insight (optional)
 * @param {string} props.format - The format to display the value (currency, percentage, etc.) (optional)
 * @param {Function} props.formatAmount - Function to format currency amounts (optional)
 * @param {React.ReactNode} props.children - Additional content (optional)
 */
const InsightCard = ({
  title,
  description,
  type = 'neutral',
  icon,
  value,
  format = 'text',
  formatAmount,
  children
}) => {
  const getTypeColor = (type) => {
    switch(type.toLowerCase()) {
      case 'positive':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-500 bg-amber-50 border-amber-200';
      default:
        return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  const getTypeIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'positive':
        return icon || 'mdi:trending-up';
      case 'negative':
        return icon || 'mdi:trending-down';
      case 'warning':
        return icon || 'mdi:alert-circle';
      default:
        return icon || 'mdi:information';
    }
  };

  const formattedValue = () => {
    if (value === undefined) return null;
    
    switch(format) {
      case 'currency':
        return formatAmount ? formatAmount(value) : `KES ${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  return (
    <Card className={`border-l-4 ${getTypeColor(type)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium flex items-center">
            <Icon icon={getTypeIcon(type)} className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
          {value !== undefined && (
            <Badge variant="outline" className="text-sm font-medium">
              {formattedValue()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        {children}
      </CardContent>
    </Card>
  );
};

export default InsightCard;

