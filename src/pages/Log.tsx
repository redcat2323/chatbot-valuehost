import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { ChartSection } from "@/components/dashboard/ChartSection";
import { InstructionForm } from "@/components/dashboard/InstructionForm";
import { InstructionList } from "@/components/dashboard/InstructionList";

const Log = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setIsAuthenticated(true);
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Painel de Monitoramento</h1>
      
      <StatsSection />
      <ChartSection />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Instruções Personalizadas</h2>
        <InstructionForm />
        <InstructionList />
      </div>
    </div>
  );
};

export default Log;