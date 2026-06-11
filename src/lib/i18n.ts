import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      welcome: "Welcome back",
      login: "Login",
      email: "Email",
      password: "Password",
      recentSessions: "Your Recent Sessions",
      startSession: "Start New Session",
      dashboard: "Dashboard",
      chat: "AI Chat",
      selectPain: "Select Pain Area",
      intensity: "Intensity",
      language: "Language",
      chatPlaceholder: "How are you feeling today?"
    }
  },
  pidgin: {
    translation: {
      welcome: "Welcome back",
      login: "Log in",
      email: "Email",
      password: "Password",
      recentSessions: "Your Recent Sessions",
      startSession: "Start New Session",
      dashboard: "Dashboard",
      chat: "AI Chat",
      selectPain: "Choose where e dey pain you",
      intensity: "How e strong reach",
      language: "Language",
      chatPlaceholder: "How body today?"
    }
  },
  yo: {
    translation: {
      welcome: "Kaabo pada",
      login: "Wọlé",
      email: "Imeeli",
      password: "Ọrọ igbaniwọle",
      recentSessions: "Awọn akoko rẹ laipe",
      startSession: "Bẹrẹ Akoko Titun",
      dashboard: "Dasibodu",
      chat: "Iwiregbe AI",
      selectPain: "Yan Agbegbe Irora",
      intensity: "Bí ó ti le tó",
      language: "Ede",
      chatPlaceholder: "Bawo ni o ṣe rilara loni?"
    }
  },
  ig: {
    translation: {
      welcome: "Nnọọ",
      login: "Banye",
      email: "Email",
      password: "Okwu paswọọdụ",
      recentSessions: "Oge gị na nso nso a",
      startSession: "Malite oge ọhụrụ",
      dashboard: "Dashboard",
      chat: "Mkparịta ụka AI",
      selectPain: "Họrọ mpaghara mgbu",
      intensity: "Ike mgbu",
      language: "Asụsụ",
      chatPlaceholder: "Kedu ka ị dị taa?"
    }
  },
  ha: {
    translation: {
      welcome: "Barka da dawowa",
      login: "Shiga",
      email: "Imel",
      password: "Kalmar sirri",
      recentSessions: "Zaman ku na baya-bayan nan",
      startSession: "Fara Sabon Zama",
      dashboard: "Dashboard",
      chat: "Tattaunawar AI",
      selectPain: "Zaɓi Yankin Jin zafi",
      intensity: "Tsananin zafi",
      language: "Harshe",
      chatPlaceholder: "Yaya kake jin jiki yau?"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
