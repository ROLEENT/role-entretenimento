import { Routes, Route } from "react-router-dom";
import PartnersList from "./admin/partners/List";
import PartnerForm from "./admin/partners/Form";

export default function AdminPartnersManagement() {
  return (
    <Routes>
      <Route index element={<PartnersList />} />
      <Route path="new" element={<PartnerForm />} />
      <Route path=":id/edit" element={<PartnerForm />} />
    </Routes>
  );
}