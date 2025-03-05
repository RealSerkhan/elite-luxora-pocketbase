import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en', // Default language
    preload: ['en', 'ar'], // Load these languages
    backend: {
      loadPath: './locales/{{lng}}.json' // Load JSON files
    }
  });

export default i18next;