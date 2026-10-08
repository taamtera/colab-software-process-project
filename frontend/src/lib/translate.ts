import translations from './translations.json';

export type Language = 'en' | 'th';
const dictionary: Record<string, string> = translations;

// Translate interface copy only. Source titles, names, IDs, and documents stay intact.
export function translate(text: string, language: Language): string {
  return language === 'th' && Object.hasOwn(dictionary, text) ? dictionary[text] : text;
}

export const PROCUREMENT_METHOD_LABELS: Record<string, string> = {
  'ประกวดราคาอิเล็กทรอนิกส์ (e-bidding)': 'Electronic bidding (e-bidding)',
  'เฉพาะเจาะจง': 'Specific Selection', 'คัดเลือก': 'Selective', 'สอบราคา': 'Price Inquiry',
  'จ้างที่ปรึกษาโดยวิธีประกาศเชิญชวนทั่วไป': 'General invitation for consulting services'
};
export function procurementMethodLabel(value: string, language: Language) {
  return translate(PROCUREMENT_METHOD_LABELS[value] ?? value, language);
}
