import type { SupabaseClient } from "@supabase/supabase-js";

// Types
interface CreditCheckResult {
  canGenerate: boolean;
  creditsUsed: number;
  creditsRemaining: number;
  plan: string;
  isAtLimit: boolean;
  maxCredits: number;
}

interface CreditDeductResult {
  success: boolean;
  newCreditsUsed: number;
  creditsRemaining: number;
  error?: string;
}

// Constants
const MAX_FREE_CREDITS = 5;

export class CreditService {
  /**
   * Check user credits without deducting
   */
  static async checkCredits(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<CreditCheckResult> {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("email_credits, plan")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error checking user credits:", error);
        throw new Error("Failed to check user credits");
      }

      const creditsUsed = user.email_credits || 0;
      const plan = user.plan || "freemium";
      const maxCredits = plan === "premium" ? Infinity : MAX_FREE_CREDITS;
      const creditsRemaining =
        plan === "premium"
          ? Infinity
          : Math.max(0, MAX_FREE_CREDITS - creditsUsed);
      const isAtLimit = plan === "freemium" && creditsUsed >= MAX_FREE_CREDITS;

      return {
        canGenerate: plan === "premium" || creditsUsed < MAX_FREE_CREDITS,
        creditsUsed,
        creditsRemaining,
        plan,
        isAtLimit,
        maxCredits: plan === "premium" ? Infinity : MAX_FREE_CREDITS,
      };
    } catch (error) {
      console.error("❌ Error in checkCredits:", error);
      throw error;
    }
  }

  /**
   * Atomic operation: Check credits AND deduct if available
   * This prevents race conditions
   */
  static async checkAndDeductCredit(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<CreditDeductResult> {
    try {
      // First, check current credits
      const creditCheck = await this.checkCredits(userId, supabase);

      if (!creditCheck.canGenerate) {
        return {
          success: false,
          newCreditsUsed: creditCheck.creditsUsed,
          creditsRemaining: creditCheck.creditsRemaining,
          error:
            creditCheck.plan === "freemium"
              ? `You have used all ${MAX_FREE_CREDITS} free email generations. Upgrade to Premium for unlimited access.`
              : "Unable to generate email at this time.",
        };
      }

      // If premium, don't deduct credits
      if (creditCheck.plan === "premium") {
        return {
          success: true,
          newCreditsUsed: creditCheck.creditsUsed,
          creditsRemaining: Infinity,
        };
      }

      // For freemium users, deduct credit atomically
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          email_credits: creditCheck.creditsUsed + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("email_credits", creditCheck.creditsUsed) // Prevent race conditions
        .select("email_credits")
        .single();

      if (updateError) {
        console.error("❌ Error deducting credit:", updateError);

        // If update failed due to concurrent modification, try again
        if (updateError.code === "PGRST116") {
          console.log("🔄 Concurrent modification detected, retrying...");
          return await this.checkAndDeductCredit(userId, supabase);
        }

        throw new Error("Failed to deduct credit");
      }

      const newCreditsUsed = updatedUser.email_credits;
      const newCreditsRemaining = Math.max(
        0,
        MAX_FREE_CREDITS - newCreditsUsed,
      );

      console.log("✅ Credit deducted successfully:", {
        userId,
        newCreditsUsed,
        creditsRemaining: newCreditsRemaining,
      });

      return {
        success: true,
        newCreditsUsed,
        creditsRemaining: newCreditsRemaining,
      };
    } catch (error) {
      console.error("❌ Error in checkAndDeductCredit:", error);
      return {
        success: false,
        newCreditsUsed: 0,
        creditsRemaining: 0,
        error: "Failed to process credit deduction",
      };
    }
  }

  /**
   * Get user's current credit status for display
   */
  static async getCreditStatus(
    userId: string,
    supabase: SupabaseClient,
  ): Promise<CreditCheckResult> {
    return await this.checkCredits(userId, supabase);
  }
}

// Export types for use in other files
export type { CreditCheckResult, CreditDeductResult };
export { MAX_FREE_CREDITS };
