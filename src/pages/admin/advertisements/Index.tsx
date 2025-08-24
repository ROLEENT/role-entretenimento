import { Routes, Route } from 'react-router-dom';
import AdvertisementsList from './List';
import AdvertisementForm from './Form';

export default function AdvertisementsRoutes() {
  return (
    <Routes>
      <Route index element={<AdvertisementsList />} />
      <Route path="new" element={<AdvertisementForm />} />
      <Route path=":id/edit" element={<AdvertisementForm />} />
    </Routes>
  );
}