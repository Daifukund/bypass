import { useSearchStore } from "@/stores/search-store";
import { useRouter } from "next/navigation";

export const useSearchNavigation = () => {
  const { criteria, companies, selectedCompany, employees, selectedEmployee } = useSearchStore();
  const router = useRouter();

  const canNavigateToCompanies = () => !!criteria;
  const canNavigateToEmployees = () => !!selectedCompany;
  const canNavigateToEmails = () => !!selectedEmployee;

  const navigateToStep = (step: "criteria" | "companies" | "employees" | "emails") => {
    switch (step) {
      case "criteria":
        router.push("/criteria");
        break;
      case "companies":
        if (canNavigateToCompanies()) {
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

  return {
    canNavigateToCompanies,
    canNavigateToEmployees,
    canNavigateToEmails,
    navigateToStep,
  };
};
