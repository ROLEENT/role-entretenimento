import { Routes, Route } from 'react-router-dom';

// Temporary stubs - will be implemented in next steps
function PartnersList() {
  return <div>Partners List - Coming Soon</div>;
}

function PartnersForm() {
  return <div>Partners Form - Coming Soon</div>;
}

export default function PartnersRoutes() {
  return (
    <Routes>
      <Route index element={<PartnersList />} />
      <Route path="new" element={<PartnersForm />} />
      <Route path=":id/edit" element={<PartnersForm />} />
    </Routes>
  );
}