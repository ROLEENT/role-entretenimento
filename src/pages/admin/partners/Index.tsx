import { useParams } from "react-router-dom";
import PartnersList from "./List";
import PartnerForm from "./Form";

export default function PartnersIndex() {
  const { id } = useParams();
  const isForm = location.pathname.includes('/new') || location.pathname.includes('/edit');

  if (isForm) {
    return <PartnerForm />;
  }

  return <PartnersList />;
}