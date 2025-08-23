import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SearchAndFilters from "@/components/SearchAndFilters";
import EventCategories from "@/components/EventCategories";
import FeaturedEventsToday from "@/components/FeaturedEventsToday";
import MusicCategories from "@/components/MusicCategories";
import HowItWorks from "@/components/HowItWorks";
import MagazineBanner from "@/components/MagazineBanner";
import AdvertisementBanner from "@/components/AdvertisementBanner";
import StatsSection from "@/components/StatsSection";
import Newsletter from "@/components/Newsletter";
import Testimonials from "@/components/Testimonials";
import PartnersVenues from "@/components/PartnersVenues";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import FavoritesPanel from "@/components/FavoritesPanel";
import GeolocationEvents from "@/components/GeolocationEvents";
import EventCalendar from "@/components/EventCalendar";
import FeaturedHighlights from "@/components/FeaturedHighlights";
import FeaturedBlogPosts from "@/components/FeaturedBlogPosts";
import { Toaster } from "@/components/ui/sonner";
import { type FilterState } from "@/hooks/useSearchAndFilter";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    city: "",
    priceRange: "",
    date: ""
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ScrollAnimationWrapper>
          <section className="py-8 bg-background/50">
            <div className="container mx-auto px-4">
              <SearchAndFilters 
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
              />
            </div>
          </section>
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <EventCategories />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <FeaturedEventsToday searchQuery={searchQuery} filters={filters} />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <GeolocationEvents />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <EventCalendar />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <FeaturedHighlights />
        </ScrollAnimationWrapper>
        <FeaturedBlogPosts />
        <ScrollAnimationWrapper>
          <MusicCategories />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <AdvertisementBanner />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <HowItWorks />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <MagazineBanner />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <StatsSection />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <Testimonials />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <PartnersVenues />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <FavoritesPanel />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper>
          <Newsletter />
        </ScrollAnimationWrapper>
      </main>
      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
};

export default Index;
