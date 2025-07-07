import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Validation schema (you can enhance this later with Zod)
interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  university?: string;
  study_level?: string;
  field_of_study?: string;
  phone?: string;
  linkedin?: string;
  language?: string;
  bio_text?: string;
  personal_website?: string;
}

// Create server-side Supabase client
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// Validate profile data
function validateProfileData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Basic validation
  if (data.first_name && typeof data.first_name !== "string") {
    errors.push("First name must be a string");
  }
  if (data.last_name && typeof data.last_name !== "string") {
    errors.push("Last name must be a string");
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }
  if (data.linkedin && data.linkedin.length > 0 && !data.linkedin.includes("linkedin.com")) {
    errors.push("LinkedIn URL must be a valid LinkedIn profile");
  }
  if (data.personal_website && data.personal_website.length > 0) {
    try {
      new URL(data.personal_website);
    } catch {
      errors.push("Personal website must be a valid URL");
    }
  }
  if (data.bio_text && data.bio_text.length > 500) {
    errors.push("Bio must be 500 characters or less");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// GET - Fetch user profile
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create default one
      const defaultProfile = {
        id: user.id,
        email: user.email,
        plan: "freemium",
        email_credits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newProfile, error: createError } = await supabase
        .from("users")
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) {
        console.error("Error creating profile:", createError);
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        profile: newProfile,
      });
    }

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error in profile GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input data
    const validation = validateProfileData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: ProfileUpdateData & { updated_at: string } = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in profile PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete user account
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user data from all tables (cascade delete)
    const { error: deleteError } = await supabase.from("users").delete().eq("id", user.id);

    if (deleteError) {
      console.error("Error deleting user data:", deleteError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Delete from Supabase Auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      // Continue anyway, user data is already deleted
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error in profile DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
