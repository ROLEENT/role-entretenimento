import { lazy } from 'react';

// Lazy load admin pages for better performance
export const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
export const AdminHighlightsManagement = lazy(() => import('@/pages/AdminHighlightsManagement'));
export const AdminHighlightEditor = lazy(() => import('@/pages/AdminHighlightEditor'));
export const AdminPostEditor = lazy(() => import('@/pages/AdminPostEditor'));
export const AdminAnalytics = lazy(() => import('@/pages/AdminAnalytics'));
export const AdminProfile = lazy(() => import('@/pages/AdminProfile'));
export const AdminVenuesManagement = lazy(() => import('@/pages/AdminVenuesManagement'));
export const AdminPartnersManagement = lazy(() => import('@/pages/AdminPartnersManagement'));
export const AdminAdvertisements = lazy(() => import('@/pages/AdminAdvertisements'));
export const AdminCategoriesManagement = lazy(() => import('@/pages/AdminCategoriesManagement'));
export const AdminCommentsManagement = lazy(() => import('@/pages/AdminCommentsManagement'));
export const AdminContactMessages = lazy(() => import('@/pages/AdminContactMessages'));
export const AdminBlogPostsHistory = lazy(() => import('@/pages/AdminBlogPostsHistory'));
export const AdminEventCreate = lazy(() => import('@/pages/AdminEventCreate'));
export const AdminLoginSimple = lazy(() => import('@/pages/AdminLoginSimple'));
export const AdminEventsManagement = lazy(() => import('@/pages/admin/AdminEventsManagement'));
export const AdminNotifications = lazy(() => import('@/pages/admin/AdminNotifications'));
export const AdminAnalyticsReports = lazy(() => import('@/pages/admin/AdminAnalyticsReports'));
export const AdminPerformance = lazy(() => import('@/pages/admin/AdminPerformance'));

// Lazy load other heavy pages
export const EventsPage = lazy(() => import('@/pages/EventsPage'));
export const EventDetailPage = lazy(() => import('@/pages/EventDetailPage'));
export const HighlightDetailPage = lazy(() => import('@/pages/HighlightDetailPage'));
export const BlogArticle = lazy(() => import('@/pages/BlogArticle'));
export const CityBlogPage = lazy(() => import('@/pages/CityBlogPage'));