import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Dashboard
import AdminV2Dashboard from '@/pages/AdminV2Dashboard';

// Artist Management
import AdminArtists from '@/pages/admin/artists/Index';
import AdminArtistCreate from '@/pages/admin/artists/Create';
import AdminArtistEdit from '@/pages/admin/artists/Edit';

// Venue Management 
import AdminVenues from '@/pages/admin/venues/Index';
import AdminVenueCreate from '@/pages/admin/venues/Create';
import AdminVenueEdit from '@/pages/admin/venues/Edit';

// Event Management
import AdminEvents from '@/pages/admin/events/Index';
import AdminEventCreate from '@/pages/admin/events/Create';
import AdminEventEdit from '@/pages/admin/events/Edit';

// Organizer Management
import AdminOrganizers from '@/pages/admin/organizers/Index';
import AdminOrganizerCreate from '@/pages/admin/organizers/Create';
import AdminOrganizerEdit from '@/pages/admin/organizers/Edit';

// Highlight Management
import AdminHighlights from '@/pages/admin/highlights/Index';
import AdminHighlightCreate from '@/pages/admin/highlights/Create';
import AdminHighlightEdit from '@/pages/admin/highlights/Edit';

export default function AdminV2Router() {
  return (
    <>
      <Helmet>
        <title>Admin V2 - Plataforma Role</title>
        <meta name="description" content="Painel administrativo simplificado da plataforma Role" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <Routes>
        {/* Dashboard */}
        <Route index element={<AdminV2Dashboard />} />
        
        {/* Artist Management */}
        <Route path="artists" element={<AdminArtists />} />
        <Route path="artists/create" element={<AdminArtistCreate />} />
        <Route path="artists/:id/edit" element={<AdminArtistEdit />} />
        
        {/* Venue Management */}
        <Route path="venues" element={<AdminVenues />} />
        <Route path="venues/create" element={<AdminVenueCreate />} />
        <Route path="venues/:id/edit" element={<AdminVenueEdit />} />
        
        {/* Event Management */}
        <Route path="events" element={<AdminEvents />} />
        <Route path="events/create" element={<AdminEventCreate />} />
        <Route path="events/:id/edit" element={<AdminEventEdit />} />
        
        {/* Organizer Management */}
        <Route path="organizers" element={<AdminOrganizers />} />
        <Route path="organizers/create" element={<AdminOrganizerCreate />} />
        <Route path="organizers/:id/edit" element={<AdminOrganizerEdit />} />
        
        {/* Highlight Management */}
        <Route path="highlights" element={<AdminHighlights />} />
        <Route path="highlights/create" element={<AdminHighlightCreate />} />
        <Route path="highlights/:id/edit" element={<AdminHighlightEdit />} />
      </Routes>
    </>
  );
}