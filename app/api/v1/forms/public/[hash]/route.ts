import { NextRequest } from "next/server";
import { FormModel } from "@/src/modules/forms/form.model";
import { AppError, handleApiError, successResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    if (!hash) throw new AppError("رابط النموذج غير صحيح", 400);

    const form = await FormModel.findByHash(hash);
    if (!form) throw new AppError("الرابط غير صحيح أو منتهي", 404);
    if (!form.is_active) throw new AppError("عذراً، تم إغلاق التسجيل من قبل الإدارة", 403);

    return successResponse(form, "تم جلب بيانات النموذج بنجاح");
  } catch (error) {
    return handleApiError(error);
  }
}
