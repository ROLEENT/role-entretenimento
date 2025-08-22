import { useState, useMemo } from "react";

export interface FilterState {
  category: string;
  city: string;
  priceRange: string;
  date: string;
}

export interface Event {
  id: string;
  title: string;
  category: string;
  city: string;
  price: number;
  date: string;
  description?: string;
  image?: string;
}

export const useSearchAndFilter = (events: Event[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    city: "",
    priceRange: "",
    date: ""
  });

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(event => event.city === filters.city);
    }

    // Price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(event => {
        const price = event.price;
        switch (filters.priceRange) {
          case "free":
            return price === 0;
          case "0-50":
            return price > 0 && price <= 50;
          case "50-100":
            return price > 50 && price <= 100;
          case "100-200":
            return price > 100 && price <= 200;
          case "200+":
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Date filter
    if (filters.date) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const monthEnd = new Date(today);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        switch (filters.date) {
          case "today":
            return eventDate >= today && eventDate < tomorrow;
          case "tomorrow":
            const dayAfterTomorrow = new Date(tomorrow);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
            return eventDate >= tomorrow && eventDate < dayAfterTomorrow;
          case "week":
            return eventDate >= today && eventDate <= weekEnd;
          case "month":
            return eventDate >= today && eventDate <= monthEnd;
          case "upcoming":
            return eventDate >= today;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [events, searchQuery, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    filteredEvents,
    hasActiveFilters: searchQuery || Object.values(filters).some(Boolean)
  };
};