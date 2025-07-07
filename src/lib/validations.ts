import { z } from "zod";

// User profile validation
export const UserProfileSchema = z.object({
  first_name: z.string().max(50, "First name too long").optional().or(z.literal("")),
  last_name: z.string().max(50, "Last name too long").optional().or(z.literal("")),
  university: z.string().max(100, "University name too long").optional().or(z.literal("")),
  study_level: z.enum(["Bachelor", "Master", "PhD", "Other"]).optional().or(z.literal("")),
  field_of_study: z.string().max(100, "Field of study too long").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  personal_website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  bio_text: z.string().max(500, "Bio too long").optional().or(z.literal("")),
  language: z.enum(["English", "French", "German", "Spanish"]).default("English"),
});

// Search criteria validation
export const SearchCriteriaSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required").max(100, "Job title too long"),
  location: z.string().max(100, "Location too long").optional(),
  jobType: z.string().max(50, "Job type too long").optional(),
  industry: z.string().max(100, "Industry too long").optional(),
  platforms: z.string().max(200, "Platforms too long").optional(),
  companySize: z.string().max(50, "Company size too long").optional(),
  experienceLevel: z.string().max(50, "Experience level too long").optional(),
  keywords: z.array(z.string()).or(z.string()).optional(),
  language: z.string().max(20, "Language too long").optional(),
  expectedSalary: z.string().max(50, "Expected salary too long").optional(),
  excludeCompanies: z.string().max(500, "Exclude companies too long").optional(),
});

// Email generation validation
export const EmailGenerationSchema = z.object({
  contactName: z.string().min(1, "Contact name is required").max(100, "Contact name too long"),
  jobTitle: z.string().min(1, "Job title is required").max(100, "Job title too long"),
  companyName: z.string().min(1, "Company name is required").max(100, "Company name too long"),
  location: z.string().max(100, "Location too long").optional(),
  emailType: z.enum(["Networking", "Cold Application", "Referral Request", "Coffee Chat"]),
  language: z.string().default("English"),
});

// Email address generation validation
export const EmailAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100, "Full name too long"),
  companyName: z.string().min(1, "Company name is required").max(100, "Company name too long"),
});

// Employee search validation
export const EmployeeSearchSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100, "Company name too long"),
  jobTitle: z.string().min(1, "Job title is required").max(100, "Job title too long"),
  location: z.string().max(100, "Location too long").optional(),
});

// Helper function to validate and return errors
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ["Validation failed"],
    };
  }
}

// Export types for use in other files
export type UserProfileInput = z.infer<typeof UserProfileSchema>;
export type SearchCriteriaInput = z.infer<typeof SearchCriteriaSchema>;
export type EmailGenerationInput = z.infer<typeof EmailGenerationSchema>;
export type EmailAddressInput = z.infer<typeof EmailAddressSchema>;
export type EmployeeSearchInput = z.infer<typeof EmployeeSearchSchema>;
