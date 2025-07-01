import { useSearchStore } from "@/stores/search-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useSearchNavigation = () => {
  const { criteria, companies, selectedCompany, employees, selectedEmployee } = useSearchStore();
  const router = useRouter();

  const canNavigateToCompanies = () => !!criteria;
  const canNavigateToEmployees = () => !!selectedCompany;
  const canNavigateToEmails = () => !!selectedEmployee;

  // ✅ Enhanced navigation with user confirmation
  const navigateToStep = (
    step: "criteria" | "companies" | "employees" | "emails",
    force = false
  ) => {
    const confirmNavigation = (message: string) => {
      if (force) return true;
      return window.confirm(`${message}\n\nYour current progress will be saved. Continue?`);
    };

    switch (step) {
      case "criteria":
        if (
          selectedEmployee &&
          !confirmNavigation("Going back to criteria will start a new search.")
        ) {
          return;
        }
        router.push("/criteria");
        break;
      case "companies":
        if (canNavigateToCompanies()) {
          if (
            selectedEmployee &&
            !confirmNavigation("Going back to companies will lose your current employee selection.")
          ) {
            return;
          }
          router.push("/companies");
        } else {
          router.push("/criteria");
        }
        break;
      case "employees":
        if (canNavigateToEmployees()) {
          router.push("/employees");
        } else if (canNavigateToCompanies()) {
          router.push("/companies");
        } else {
          router.push("/criteria");
        }
        break;
      case "emails":
        if (canNavigateToEmails()) {
          router.push("/emails");
        } else if (canNavigateToEmployees()) {
          router.push("/employees");
        } else if (canNavigateToCompanies()) {
          router.push("/companies");
        } else {
          router.push("/criteria");
        }
        break;
    }
  };

  // ✅ Add browser back button protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedEmployee || selectedCompany) {
        e.preventDefault();
        e.returnValue = "You have unsaved progress. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedEmployee, selectedCompany]);

  return {
    canNavigateToCompanies,
    canNavigateToEmployees,
    canNavigateToEmails,
    navigateToStep,
  };
};
