import { useNavigate } from "react-router-dom";
import { MagazineFormV5 } from "@/components/v5/forms/MagazineFormV5";

export default function AdminV3MagazineCreate() {
  const navigate = useNavigate();

  const handleSuccess = (data: any) => {
    navigate(`/admin-v3/magazine/${data.id}/edit`);
  };

  const handleCancel = () => {
    navigate("/admin-v3/magazine");
  };

  return (
    <div className="container mx-auto py-6">
      <MagazineFormV5
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}