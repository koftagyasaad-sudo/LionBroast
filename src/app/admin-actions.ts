// =========================================================================
// 1. حذف التصنيف مع جميع الأصناف التابعة له (Cascade Delete)
// =========================================================================
export async function deleteCategoryAction(id: string) {
  try {
    const catId = String(id);
    // 1. حذف الأصناف التابعة للتصنيف أولاً لفك ارتباط Foreign Key
    await db.delete(menuItems).where(eq(menuItems.categoryId, catId));
    // 2. حذف التصنيف نفسه
    await db.delete(categories).where(eq(categories.id, catId));

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    console.error("deleteCategoryAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveCategoryAction = upsertCategoryAction;
export const adminDeleteCategoryAction = deleteCategoryAction;

// =========================================================================
// 2. دالة تنظيف ومسح شامل لجميع الأقسام والمكررات بضغطة واحدة
// =========================================================================
export async function adminClearAllCategoriesAction() {
  try {
    await db.delete(menuItems);
    await db.delete(categories);

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}
