import { supabase } from "./supabase";

export async function saveJarToCloud(code: string, studentName: string, treats: number) {
  try {
    const { error } = await supabase
      .from("student_progress")
      .upsert(
        { code, student_name: studentName, treats },
        { onConflict: "code,student_name" }
      );
    if (error) console.error("[cloudSave] jar save failed:", error.message);
    else console.log("[cloudSave] jar saved:", code, studentName, treats);
  } catch (e) {
    console.error("[cloudSave] jar save threw:", e);
  }
}

export async function loadJarFromCloud(code: string, studentName: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from("student_progress")
      .select("treats")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] jar load failed:", error.message); return null; }
    return data ? data.treats : null;
  } catch (e) {
    console.error("[cloudSave] jar load threw:", e);
    return null;
  }
}

export async function saveDataToCloud(
  code: string,
  studentName: string,
  activePet: string | null,
  data: Record<string, any>
) {
  try {
    // Merge: read existing blob first so a second world does not wipe the first.
    const { data: existing } = await supabase
      .from("student_progress")
      .select("data")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    const merged = { ...(existing?.data ?? {}), ...data };
    const row: Record<string, any> = { code, student_name: studentName, data: merged };
    if (activePet !== null) row.active_pet = activePet;
    const { error } = await supabase
      .from("student_progress")
      .upsert(
        row,
        { onConflict: "code,student_name" }
      );
    if (error) console.error("[cloudSave] data save failed:", error.message);
    else console.log("[cloudSave] data saved:", code, studentName);
  } catch (e) {
    console.error("[cloudSave] data save threw:", e);
  }
}

export async function loadDataFromCloud(
  code: string,
  studentName: string
): Promise<{ activePet: string | null; data: Record<string, any> | null } | null> {
  try {
    const { data: row, error } = await supabase
      .from("student_progress")
      .select("active_pet, data")
      .eq("code", code)
      .eq("student_name", studentName)
      .maybeSingle();
    if (error) { console.error("[cloudSave] data load failed:", error.message); return null; }
    if (!row) return null;
    return { activePet: row.active_pet ?? null, data: row.data ?? null };
  } catch (e) {
    console.error("[cloudSave] data load threw:", e);
    return null;
  }
}
