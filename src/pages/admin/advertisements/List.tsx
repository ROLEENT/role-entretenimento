import { Routes, Route } from 'react-router-dom';

// Temporary stubs - will be implemented in next steps
function AdvertisementsList() {
  return <div>Advertisements List - Coming Soon</div>;
}

function AdvertisementsForm() {
  return <div>Advertisements Form - Coming Soon</div>;
}

export default function AdvertisementsRoutes() {
  return (
    <Routes>
      <Route index element={<AdvertisementsList />} />
      <Route path="new" element={<AdvertisementsForm />} />
      <Route path=":id/edit" element={<AdvertisementsForm />} />
    </Routes>
  );
}