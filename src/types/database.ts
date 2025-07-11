// Database types that match your Supabase schema exactly
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          university: string | null;
          study_level: string | null;
          field_of_study: string | null;
          phone: string | null;
          linkedin: string | null;
          language: string | null;
          bio_text: string | null;
          personal_website: string | null;
          plan: "freemium" | "premium";
          email_credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          university?: string | null;
          study_level?: string | null;
          field_of_study?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          language?: string | null;
          bio_text?: string | null;
          personal_website?: string | null;
          plan?: "freemium" | "premium";
          email_credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          university?: string | null;
          study_level?: string | null;
          field_of_study?: string | null;
          phone?: string | null;
          linkedin?: string | null;
          language?: string | null;
          bio_text?: string | null;
          personal_website?: string | null;
          plan?: "freemium" | "premium";
          email_credits?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      search_criteria: {
        Row: {
          id: string;
          user_id: string;
          jobTitle: string;
          location: string | null;
          jobType: string | null;
          industry: string | null;
          platforms: string | null;
          companySize: string | null;
          experienceLevel: string | null;
          keywords: string | null;
          language: string | null;
          expectedSalary: string | null;
          excludeCompanies: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          jobTitle: string;
          location?: string | null;
          jobType?: string | null;
          industry?: string | null;
          platforms?: string | null;
          companySize?: string | null;
          experienceLevel?: string | null;
          keywords?: string | null;
          language?: string | null;
          expectedSalary?: string | null;
          excludeCompanies?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          jobTitle?: string;
          location?: string | null;
          jobType?: string | null;
          industry?: string | null;
          platforms?: string | null;
          companySize?: string | null;
          experienceLevel?: string | null;
          keywords?: string | null;
          language?: string | null;
          expectedSalary?: string | null;
          excludeCompanies?: string | null;
          created_at?: string;
        };
      };
      company_suggestions: {
        Row: {
          id: string;
          user_id: string;
          search_criteria_id: string;
          name: string;
          logoUrl: string | null;
          description: string;
          estimatedEmployees: string | null;
          relevanceScore: string;
          location: string | null;
          linkedinUrl: string | null;
          websiteUrl: string | null;
          source: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          search_criteria_id: string;
          name: string;
          logoUrl?: string | null;
          description: string;
          estimatedEmployees?: string | null;
          relevanceScore: string;
          location?: string | null;
          linkedinUrl?: string | null;
          websiteUrl?: string | null;
          source: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          search_criteria_id?: string;
          name?: string;
          logoUrl?: string | null;
          description?: string;
          estimatedEmployees?: string | null;
          relevanceScore?: string;
          location?: string | null;
          linkedinUrl?: string | null;
          websiteUrl?: string | null;
          source?: string;
          created_at?: string;
        };
      };
      employee_contacts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          title: string;
          location: string | null;
          linkedinUrl: string | null;
          relevanceScore: string;
          source: string;
          department: string | null;
          seniority_level: string | null;
          years_at_company: string | null;
          profile_image: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          title: string;
          location?: string | null;
          linkedinUrl?: string | null;
          relevanceScore: string;
          source: string;
          department?: string | null;
          seniority_level?: string | null;
          years_at_company?: string | null;
          profile_image?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          name?: string;
          title?: string;
          location?: string | null;
          linkedinUrl?: string | null;
          relevanceScore?: string;
          source?: string;
          department?: string | null;
          seniority_level?: string | null;
          years_at_company?: string | null;
          profile_image?: string | null;
          created_at?: string;
        };
      };
      email_generation: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          employee_id: string | null;
          emailAddress: string | null;
          confidenceScore: number | null;
          emailType: string | null;
          generatedEmail: string | null;
          generatedSubject: string | null;
          status: "pending" | "sent" | "failed";
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          company_id?: string | null;
          employee_id?: string | null;
          emailAddress?: string | null;
          confidenceScore?: number | null;
          emailType?: string | null;
          generatedEmail?: string | null;
          generatedSubject?: string | null;
          status?: "pending" | "sent" | "failed";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          employee_id?: string | null;
          emailAddress?: string | null;
          confidenceScore?: number | null;
          emailType?: string | null;
          generatedEmail?: string | null;
          generatedSubject?: string | null;
          status?: "pending" | "sent" | "failed";
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "freemium" | "premium";
          status: "active" | "canceled" | "expired";
          startedAt: string;
          expiresAt: string | null;
          stripeCustomerId: string | null;
          stripeSubscriptionId: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          plan: "freemium" | "premium";
          status: "active" | "canceled" | "expired";
          startedAt: string;
          expiresAt?: string | null;
          stripeCustomerId?: string | null;
          stripeSubscriptionId?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "freemium" | "premium";
          status?: "active" | "canceled" | "expired";
          startedAt?: string;
          expiresAt?: string | null;
          stripeCustomerId?: string | null;
          stripeSubscriptionId?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Export convenience types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type SearchCriteria = Database["public"]["Tables"]["search_criteria"]["Row"];
export type SearchCriteriaInsert = Database["public"]["Tables"]["search_criteria"]["Insert"];

export type CompanyRow = Database["public"]["Tables"]["company_suggestions"]["Row"];
export type CompanyInsert = Database["public"]["Tables"]["company_suggestions"]["Insert"];

export type EmployeeRow = Database["public"]["Tables"]["employee_contacts"]["Row"];
export type EmployeeInsert = Database["public"]["Tables"]["employee_contacts"]["Insert"];

export type EmailGeneration = Database["public"]["Tables"]["email_generation"]["Row"];
export type EmailGenerationInsert = Database["public"]["Tables"]["email_generation"]["Insert"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
