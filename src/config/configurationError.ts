/** An actionable configuration failure, not a failed HTTP response. Never contains secrets. */
export class ConfigurationError extends Error {
  readonly code = 'INVALID_API_CONFIGURATION';

  constructor() {
    super(
      import.meta.env.DEV
        ? 'إعداد الاتصال بالخادم غير صحيح. انسخ .env.example إلى .env، واضبط VITE_API_BASE_URL برابط الخادم المنتهي بـ /api/، ثم أعد تشغيل npm run dev.'
        : 'تعذّر الاتصال بالخدمة بسبب إعدادات الموقع. يُرجى التواصل مع إدارة المنصة.',
    );
    this.name = 'ConfigurationError';
  }
}
