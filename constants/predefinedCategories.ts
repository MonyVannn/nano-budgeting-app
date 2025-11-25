import {
  Bus,
  Car,
  Coffee,
  Globe,
  Home,
  Lightbulb,
  Phone,
  Shield,
  ShoppingCart,
  UtensilsCrossed,
  Zap,
} from "lucide-react-native";

export interface PredefinedCategory {
  name: string;
  icon: any;
  group: "essentials" | "food" | "transportation" | "lifestyle" | "savings";
  suggestedAmount?: number;
  frequency: "weekly" | "monthly";
}

export const predefinedCategories: PredefinedCategory[] = [
  // Essentials
  {
    name: "Rent",
    icon: Home,
    group: "essentials",
    frequency: "monthly",
  },
  {
    name: "Utilities",
    icon: Lightbulb,
    group: "essentials",
    frequency: "monthly",
  },
  {
    name: "Phone Bill",
    icon: Phone,
    group: "essentials",
    frequency: "monthly",
  },
  {
    name: "Internet",
    icon: Globe,
    group: "essentials",
    frequency: "monthly",
  },
  {
    name: "Insurance",
    icon: Shield,
    group: "essentials",
    frequency: "monthly",
  },
  // Food & Drink
  {
    name: "Coffee shops",
    icon: Coffee,
    group: "food",
    frequency: "monthly",
  },
  {
    name: "Eating out",
    icon: UtensilsCrossed,
    group: "food",
    frequency: "monthly",
  },
  {
    name: "Groceries",
    icon: ShoppingCart,
    group: "food",
    frequency: "monthly",
  },
  // Transportation
  {
    name: "Gas",
    icon: Zap,
    group: "transportation",
    frequency: "monthly",
  },
  {
    name: "Ubers/Lyft",
    icon: Car,
    group: "transportation",
    frequency: "monthly",
  },
  {
    name: "Public transport",
    icon: Bus,
    group: "transportation",
    frequency: "monthly",
  },
];

export const getGroupTitle = (group: string): string => {
  const titles: { [key: string]: string } = {
    essentials: "Essentials",
    food: "Food & Drink",
    transportation: "Transportation",
    lifestyle: "Lifestyle",
    savings: "Savings",
  };
  return titles[group] || group;
};

