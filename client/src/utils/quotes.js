const motivationalQuotes = [
    "הדרך הטובה ביותר לחזות את העתיד היא ליצור אותו.",
    "ההצלחה היא סך המאמצים הקטנים, שחוזרים על עצמם יום אחר יום.",
    "אל תחכה להזדמנות. צור אותה.",
    "ההבדל בין הרגיל ליוצא דופן הוא קצת אקסטרה.",
    "אתה לא צריך להיות גדול כדי להתחיל, אבל אתה צריך להתחיל כדי להיות גדול.",
    "הכאב שאתה מרגיש היום יהיה הכוח שתרגיש מחר.",
    "האמונה בעצמך היא הצעד הראשון בדרך להצלחה.",
    "אל תפחד לוותר על הטוב כדי להגיע למצוין.",
    "הגבולות היחידים הם אלה שאתה מציב לעצמך.",
    "הצלחה היא נפילה תשע פעמים וקימה עשר."
];

export const getQuoteOfTheDay = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const quoteIndex = dayOfYear % motivationalQuotes.length;

    return motivationalQuotes[quoteIndex];
};