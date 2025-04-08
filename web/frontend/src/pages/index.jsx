import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Index() {
  const navigate = useNavigate();
  
  // Redirect to carriers page
  useEffect(() => {
    navigate("/carriers");
  }, [navigate]);
  
  return null;
}