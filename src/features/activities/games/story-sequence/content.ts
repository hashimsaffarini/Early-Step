/** TEMPORARY UI DEMO CONTENT — short stories in the correct order. */
export interface StoryEvent {
  id: string;
  emoji: string;
  text: string;
}

export interface Story {
  title: string;
  /** Events in the correct order. */
  events: readonly StoryEvent[];
}

export const STORIES: readonly Story[] = [
  {
    title: 'الطفل والشجرة',
    events: [
      { id: 'tree-1', emoji: '🌱', text: 'زرع الطفل بذرة صغيرة' },
      { id: 'tree-2', emoji: '💧', text: 'سقاها بالماء كل يوم' },
      { id: 'tree-3', emoji: '☀️', text: 'أدفأتها الشمس فكبرت' },
      { id: 'tree-4', emoji: '🌳', text: 'صارت شجرة كبيرة وجميلة' },
    ],
  },
  {
    title: 'القطة والسمكة',
    events: [
      { id: 'cat-1', emoji: '😺', text: 'القطة جائعة تبحث عن طعام' },
      { id: 'cat-2', emoji: '🎣', text: 'ذهبت إلى البحيرة' },
      { id: 'cat-3', emoji: '🐟', text: 'وجدت سمكة في الماء' },
      { id: 'cat-4', emoji: '😋', text: 'أكلت وشعرت بالسعادة' },
    ],
  },
  {
    title: 'المطر وقوس قزح',
    events: [
      { id: 'rain-1', emoji: '☁️', text: 'جاءت الغيوم إلى السماء' },
      { id: 'rain-2', emoji: '🌧️', text: 'هطل المطر على الأرض' },
      { id: 'rain-3', emoji: '🌤️', text: 'توقف المطر وظهرت الشمس' },
      { id: 'rain-4', emoji: '🌈', text: 'ظهر قوس قزح ملوّن' },
    ],
  },
];
