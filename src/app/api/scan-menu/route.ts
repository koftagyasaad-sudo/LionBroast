import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // مهلة كافية لمعالجة الصور الكبيرة
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "لم يتم استلام ملف الصورة." }, { status: 400 });
    }

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      ""
    ).trim().replace(/^["']|["']$/g, "");

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "مفتاح GEMINI_API_KEY غير موجود في إعدادات البيئة بـ Vercel." },
        { status: 500 }
      );
    }

    // تحويل الملف المرفوع مباشرة إلى Base64 بدون ضغط مسبق أو تعقيد
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const promptText = `أنت خبير محترف ومسؤول مسح قوائم طعام المطاعم في نظام كاشير وإدارة سحابية.
قم بتحليل صورة منيو مطعم بروست الأسد بدقة متناهية واستخرج جميع الأصناف والأقسام والأسعار والمكونات.
أعد النتيجة حصراً بصيغة JSON Array نقية ومباشرة بدون وسوم ماركداون وبدون أي شروحات خارجية:
[
  {
    "categoryNameAr": "اسم القسم بالعربي (مثلاً: وجبات البروست، السندوتشات، الإضافات)",
    "itemNameAr": "اسم الوجبة بالعربي كاملاً",
    "descriptionAr": "مكونات الوجبة أو الشرح المكتوب إن وجد",
    "price": 120
  }
]`;

    // تجربة الموديلات الرسمية المستقرة
    const candidateModels = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let rawText = "";
    let lastError = "";

    for (const model of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    { inlineData: { mimeType, data: base64Data } },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (res.ok) {
          const jsonRes = await res.json();
          rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (rawText) break;
        } else {
          lastError = await res.text();
        }
      } catch (err: any) {
        lastError = err?.message || "Connection error";
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: `تعذر قراءة المنيو من السيرفر: ${lastError}` },
        { status: 500 }
      );
    }

    let cleanJson = rawText.trim();
    const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleanJson = jsonMatch[0];

    const items = JSON.parse(cleanJson);
    const rows = items.map((it: any) => ({
      categoryNameAr: String(it.categoryNameAr || it.categoryAr || "أصناف المنيو").trim(),
      itemNameAr: String(it.itemNameAr || it.nameAr || it.name || "وجبة جديدة").trim(),
      descriptionAr: String(it.descriptionAr || it.description || "").trim(),
      price: Number(it.price || 0),
    }));

    return NextResponse.json({ ok: true, success: true, data: rows, rows });
  } catch (error: any) {
    console.error("Scan menu API error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "حدث خطأ غير متوقع أثناء معالجة الصورة." },
      { status: 500 }
    );
  }
}
