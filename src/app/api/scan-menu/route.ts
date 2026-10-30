import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// دالة تأخير زمني لإعادة المحاولة عند ضغط سيرفرات جوجل (503)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
        { ok: false, error: "مفتاح GEMINI_API_KEY غير متوفر في إعدادات البيئة بـ Vercel." },
        { status: 500 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const promptText = `أنت نظام ذكاء اصطناعي متخصص في استخراج بيانات قوائم طعام المطاعم بدقة 100%.
قم بتحليل صورة المنيو المرفقة واستخرج جميع الأقسام والوجبات والأسعار والمكونات.
هام جداً: أعد المخرجات في شكل مصفوفة JSON Array نقية ومباشرة بدون أي وسوم ماركداون وبدون شروحات:
[
  {
    "categoryNameAr": "اسم القسم بالعربي",
    "itemNameAr": "اسم الوجبة كاملاً",
    "descriptionAr": "مكونات الوجبة إن وجدت",
    "price": 120
  }
]`;

    // قائمة موديلات سريعة وبديلة لتفادي ضغط السيرفرات
    const candidateModels = [
      "gemini-2.0-flash",
      "gemini-2.5-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ];

    let rawText = "";
    let lastError = "";

    // تجربة الموديلات مع محاولات إعادة تلقائية عند ظهور كود 503
    for (const model of candidateModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
            const errStatus = res.status;
            lastError = await res.text();
            // لو السيرفر عليه ضغط (503)، انتظر ثانية وجرب مجدداً أو انقل للموديل التالي
            if (errStatus === 503) {
              await delay(1200);
              continue;
            } else {
              break;
            }
          }
        } catch (err: any) {
          lastError = err?.message || "Connection error";
        }
      }

      if (rawText) break;
    }

    if (!rawText) {
      return NextResponse.json(
        { ok: false, error: "سيرفر الذكاء الاصطناعي مشغول حالياً، يرجى إعادة الضغط على زر الاستخراج الآن." },
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
      { ok: false, error: "حدث خطأ أثناء معالجة الصورة، يرجى المحاولة مرة أخرى." },
      { status: 500 }
    );
  }
}
