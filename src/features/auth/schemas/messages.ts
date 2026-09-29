/** Arabic validation messages shared by the auth forms. */
export const AUTH_MESSAGES = {
  emailRequired: 'البريد الإلكتروني مطلوب',
  emailInvalid: 'البريد الإلكتروني غير صالح',
  passwordRequired: 'كلمة المرور مطلوبة',
  passwordWeak: 'كلمة المرور لا تستوفي جميع الشروط',
  confirmRequired: 'يرجى تأكيد كلمة المرور',
  passwordsMismatch: 'كلمتا المرور غير متطابقتين',
  nameRequired: 'الاسم الكامل مطلوب',
  nameTooShort: 'يجب أن يحتوي الاسم على حرفين على الأقل',
  codeRequired: 'رمز التحقق مطلوب',
  codeDigitsOnly: 'يجب أن يتكون رمز التحقق من أرقام فقط',
} as const;
