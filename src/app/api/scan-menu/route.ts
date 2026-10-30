import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
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
        { ok: false, error: "مفتاح GEMINI_API_KEY غير متوفر في متغيرات بيئة Vercel." },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const promptText = `أنت نظام ذكاء اصطناعي متخصص في مسح وقراءة قوائم طعام المطاعم واستخراج البيانات لبرامج الكاشير (مثل DG Menus).
قم بتحليل صورة منيو مطعم بروست الأسد واستخرج جميع الأصناف والأقسام والأسعار والمكونات بدقة 100%.
هام جداً: أعد المخرجات حصراً في شكل مصفوفة JSON Array نقية ومباشرة بدون أي وسوم ماركداون وبدون أي شروحات جانبية:
[
  {
    "categoryNameAr": "اسم القسم بالعربي (مثلاً: وجبات فردية، مكس الأسد، عائلات مكس، وجبات عائلية ورك)",
    "itemNameAr": "اسم الوجبة كاملاً (مثلاً: وجبة ورك التوفير 8 قطع)",
    "descriptionAr": "مكونات الوجبة أو التفاصيل إن وجدت",
    "price": 180
  }
]`;

    // 1. الاستعلام الذكي لمعرفة الموديلات النشطة والمتاحة على مفتاحك حالياً (لحذف خطأ 404 نهائياً)
    let selectedModel = "gemini-2.5-flash";
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        const available: any[] = listData?.models || [];
        const contentModels = available.filter((m) =>
          m.supportedGenerationMethods?.includes("generateContent")
        );

        const best =
          contentModels.find((m) => m.name?.includes("2.5-flash")) ||
          contentModels.find((m) => m.name?.includes("2.0-flash")) ||
          contentModels.find((m) => m.name?.includes("flash")) ||
          contentModels[0];

        if (best && best.name) {
          selectedModel = best.name.replace(/^models\//, "");
        }
      }
    } catch {
      // الاعتماد على الموديل الافتراضي في حال تعذر القائمة
    }

    const candidateModels = [
      selectedModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
    ];

    let rawText = "";
    let lastError = "";

    for (const model of candidateModels) {
      try {
        const cleanName = model.replace(/^models\//, "");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
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
        });

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
