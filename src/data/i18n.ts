import type { Language } from "../types/pitchmind.ts";

export const TRANSLATIONS: Record<
  Language,
  {
    brand: string;
    nav: {
      dashboard: string;
      plan: string;
      technique: string;
      tactics: string;
      matches: string;
      recovery: string;
      chat: string;
      settings: string;
    };
    actions: {
      editProfile: string;
      logMatch: string;
      generatePlan: string;
      analyzeForm: string;
      send: string;
      save: string;
      cancel: string;
    };
    dashboard: {
      title: string;
      subtitle: string;
      streak: string;
      weeklySessions: string;
      avgRating: string;
      badgesEarned: string;
      skillRadar: string;
      selfLabel: string;
      aiLabel: string;
      weeklyReview: string;
      refreshSummary: string;
      achievements: string;
      mediaTimeline: string;
    };
    chat: {
      title: string;
      subtitle: string;
      placeholder: string;
      voiceListening: string;
      voiceIdle: string;
      quickChips: string[];
    };
    plan: {
      title: string;
      subtitle: string;
      adaptPrompt: string;
      weekPrefix: string;
      completed: string;
      skipped: string;
      pending: string;
      markComplete: string;
      skip: string;
      adjustLabel: string;
      adjustChips: string[];
    };
    technique: {
      title: string;
      subtitle: string;
      uploadHint: string;
      useSample: string;
      overallScore: string;
      strengths: string;
      priorityFixes: string;
      timeline: string;
      comparison: string;
    };
    tactics: {
      title: string;
      subtitle: string;
      explainBoard: string;
      positioning: string;
      offBall: string;
      pressing: string;
      situations: string;
      checklist: string;
    };
    matches: {
      title: string;
      subtitle: string;
      addMatch: string;
      seasonTrends: string;
      doneWell: string;
      toImprove: string;
    };
    recovery: {
      title: string;
      subtitle: string;
      weeklyLoad: string;
      overtrainingWarn: string;
      loadHealthy: string;
      conditioning: string;
      nutrition: string;
      recoveryRoutine: string;
      disclaimer: string;
    };
    settings: {
      title: string;
      subtitle: string;
      appearance: string;
      languageLabel: string;
      profileSection: string;
      aiNoteTitle: string;
      aiNoteBody: string;
      resetData: string;
    };
  }
> = {
  en: {
    brand: "PitchMind",
    nav: {
      dashboard: "Dashboard",
      plan: "Training",
      technique: "Technique",
      tactics: "Tactics",
      matches: "Matches",
      recovery: "Fitness",
      chat: "Coach",
      settings: "Settings",
    },
    actions: {
      editProfile: "Player Profile",
      logMatch: "Log Match",
      generatePlan: "Generate 4-Week Plan",
      analyzeForm: "Analyze Technique",
      send: "Send",
      save: "Save Profile",
      cancel: "Cancel",
    },
    dashboard: {
      title: "Player Progress & Skill Lab",
      subtitle: "Track skill growth, training streaks, and weekly AI coaching feedback.",
      streak: "Day Streak",
      weeklySessions: "Sessions Completed",
      avgRating: "Avg Match Rating",
      badgesEarned: "Badges Unlocked",
      skillRadar: "Skill Radar: Self vs AI Assessment",
      selfLabel: "Self-Assessed",
      aiLabel: "AI-Assessed",
      weeklyReview: "Weekly AI Summary",
      refreshSummary: "Refresh AI Summary",
      achievements: "Badges & Milestones",
      mediaTimeline: "Technique Upload Timeline",
    },
    chat: {
      title: "AI Coach Chat",
      subtitle: "Ask about technique, tactics, conditioning, nutrition, or match mindset.",
      placeholder: "Ask PitchMind Coach anything about your game...",
      voiceListening: "Listening...",
      voiceIdle: "Voice",
      quickChips: [
        "Plan today's session",
        "Fix my weak foot",
        "Pre-match routine",
        "Explain this tactic",
      ],
    },
    plan: {
      title: "4-Week Personalized Training Plan",
      subtitle: "Structured sessions tailored to your position, equipment, and weekly schedule.",
      adaptPrompt: "Adjust plan (e.g., 'sore calf, low impact today' or 'only 20 mins')",
      weekPrefix: "Week",
      completed: "Completed",
      skipped: "Skipped",
      pending: "Scheduled",
      markComplete: "Mark Complete",
      skip: "Skip",
      adjustLabel: "Quick Adjustments",
      adjustChips: ["Too hard", "No cones today", "Only 20 minutes"],
    },
    technique: {
      title: "Technique & Video/Photo Analyzer",
      subtitle: "Upload a photo or short clip to receive biomechanical fixes and corrective drills.",
      uploadHint: "Upload photo or short video clip (MP4/MOV/JPG/PNG)",
      useSample: "Or load sample frame",
      overallScore: "Form Score",
      strengths: "Strengths",
      priorityFixes: "3 Priority Fixes",
      timeline: "Key Moments Timeline",
      comparison: "Progress Comparison",
    },
    tactics: {
      title: "Tactics & Match Prep",
      subtitle: "Drag players on the pitch to test scenarios and review role-specific triggers.",
      explainBoard: "Explain This Scenario",
      positioning: "Core Positioning",
      offBall: "Off-the-Ball Movement",
      pressing: "Pressing Triggers",
      situations: "Common Match Situations",
      checklist: "Pre-Match Checklist & Mindset",
    },
    matches: {
      title: "Match Log & Self-Review",
      subtitle: "Record match stats and get structured AI post-match feedback.",
      addMatch: "Log Match Performance",
      seasonTrends: "Season Rating & Contributions",
      doneWell: "3 Things Done Well",
      toImprove: "3 Areas to Improve",
    },
    recovery: {
      title: "Fitness, Nutrition & Recovery",
      subtitle: "Monitor acute training load, football conditioning, fueling, and injury prevention.",
      weeklyLoad: "Weekly Load Tracker",
      overtrainingWarn:
        "High load spike detected — prioritize low-impact mobility, hydration, and sleep before your next hard session.",
      loadHealthy: "Training load is balanced and progressive.",
      conditioning: "Football-Specific Conditioning",
      nutrition: "Match & Training Fueling",
      recoveryRoutine: "Recovery & Injury Prevention",
      disclaimer:
        "General athletic guidance only — not medical advice. Consult a qualified physician or physiotherapist for pain or injury.",
    },
    settings: {
      title: "Preferences & Player Settings",
      subtitle: "Configure theme, English/Arabic RTL layout, player profile, and local storage.",
      appearance: "Appearance",
      languageLabel: "Language & Direction",
      profileSection: "Player Profile & Onboarding",
      aiNoteTitle: "AI Coaching Connection",
      aiNoteBody:
        "Gemini AI calls run through PitchMind's server endpoints using your environment's GEMINI_API_KEY configuration.",
      resetData: "Reset Local Data to Defaults",
    },
  },
  ar: {
    brand: "بيتش مايند",
    nav: {
      dashboard: "لوحة التقدم",
      plan: "التدريب",
      technique: "التحليل الفني",
      tactics: "التكتيك",
      matches: "المباريات",
      recovery: "اللياقة",
      chat: "المدرب",
      settings: "الإعدادات",
    },
    actions: {
      editProfile: "ملف اللاعب",
      logMatch: "تسجيل مباراة",
      generatePlan: "إنشاء خطة ٤ أسابيع",
      analyzeForm: "تحليل الأداء",
      send: "إرسال",
      save: "حفظ الملف",
      cancel: "إلغاء",
    },
    dashboard: {
      title: "لوحة التقدم ومختبر المهارات",
      subtitle: "تابع تطور مهاراتك وسلسلة التزامك وملخص المدرب الأسبوعي.",
      streak: "أيام متتالية",
      weeklySessions: "الحصص المكتملة",
      avgRating: "متوسط تقييم المباريات",
      badgesEarned: "الأوسمة المكتسبة",
      skillRadar: "مخطط المهارات: التقييم الذاتي مقابل تقييم المدرب",
      selfLabel: "تقييمك الذاتي",
      aiLabel: "تقييم المدرب الذكي",
      weeklyReview: "الملخص الأسبوعي للمدرب",
      refreshSummary: "تحديث الملخص",
      achievements: "الأوسمة والإنجازات",
      mediaTimeline: "الجدول الزمني للتحليل الفني",
    },
    chat: {
      title: "محادثة المدرب الذكي",
      subtitle: "اسأل عن المهارات، التكتيك، التغذية، الاستشفاء، أو الذهنية.",
      placeholder: "اسأل مدرب بيتش مايند أي سؤال عن مستواك...",
      voiceListening: "جارٍ الاستماع...",
      voiceIdle: "صوت",
      quickChips: [
        "خطط حصة اليوم",
        "تحسين قدمي الضعيفة",
        "روتين قبل المباراة",
        "اشرح هذا التكتيك",
      ],
    },
    plan: {
      title: "خطة التدريب الشخصية (٤ أسابيع)",
      subtitle: "حصص منظمة حسب مركزك، أدواتك المتاحة، وجدولك الأسبوعي.",
      adaptPrompt: "تعديل الخطة (مثال: لا توجد أقماع اليوم أو متاح ٢٠ دقيقة فقط)",
      weekPrefix: "الأسبوع",
      completed: "مكتملة",
      skipped: "تم التخطي",
      pending: "مجدولة",
      markComplete: "إتمام الحصة",
      skip: "تخطي",
      adjustLabel: "تعديلات سريعة",
      adjustChips: ["صعبة جداً", "لا توجد أقماع اليوم", "٢٠ دقيقة فقط"],
    },
    technique: {
      title: "تحليل التقنية بالصورة والفيديو",
      subtitle: "ارفع صورة أو مقطع فيديو قصير للحصول على تصحيحات دقيقة وتمارين علاجية.",
      uploadHint: "ارفع صورة أو مقطع فيديو قصير (MP4/MOV/JPG/PNG)",
      useSample: "أو اختر لقطة تجريبية",
      overallScore: "تقييم الأداء",
      strengths: "نقاط القوة",
      priorityFixes: "٣ تعديلات ذات أولوية",
      timeline: "الجدول الزمني للحظات الحاسمة",
      comparison: "مقارنة التطور",
    },
    tactics: {
      title: "التكتيك والاستعداد للمباراة",
      subtitle: "اسحب اللاعبين على الملعب لشرح السيناريو ومراجعة مهام مركزك.",
      explainBoard: "اشرح هذا السيناريو",
      positioning: "التمركز الأساسي",
      offBall: "التحرك بدون كرة",
      pressing: "مفاتيح الضغط",
      situations: "مواقف شائعة في المباراة",
      checklist: "قائمة ما قبل المباراة والتركيز الذهني",
    },
    matches: {
      title: "سجل المباريات والمراجعة الذاتية",
      subtitle: "سجل أرقامك في المباراة واحصل على تقييم فني من المدرب.",
      addMatch: "تسجيل أداء مباراة",
      seasonTrends: "تقييمات الموسم والمساهمات",
      doneWell: "٣ أمور أجدتها",
      toImprove: "٣ نقاط للتحسين",
    },
    recovery: {
      title: "اللياقة والتغذية والاستشفاء",
      subtitle: "راقب الحمل التدريبي الأسبوعي، تمارين السرعة، التغذية، والوقاية من الإصابات.",
      weeklyLoad: "مؤشر الحمل الأسبوعي",
      overtrainingWarn:
        "تنبيه ارتفاع الحمل التدريبي — ركز على الإطالة والترطيب والنوم قبل الحصة القوية القادمة.",
      loadHealthy: "الحمل التدريبي متوازن وتدريجي.",
      conditioning: "اللياقة البدنية الخاصة بكرة القدم",
      nutrition: "التغذية والترطيب في أيام التدريب والمباريات",
      recoveryRoutine: "الاستشفاء والوقاية من الإصابات",
      disclaimer:
        "إرشادات رياضية عامة وليست بديلاً عن الاستشارة الطبية. راجع طبيباً أو أخصائي علاج طبيعي عند الشعور بألم أو إصابة.",
    },
    settings: {
      title: "الإعدادات وملف اللاعب",
      subtitle: "تحكم في المظهر الفاتح والداكن، اللغة العربية/الإنجليزية، وتعديل ملفك الشخصي.",
      appearance: "المظهر",
      languageLabel: "اللغة واتجاه الواجهة",
      profileSection: "ملف اللاعب والتقييم الأولي",
      aiNoteTitle: "اتصال المدرب الذكي",
      aiNoteBody:
        "تعمل جميع طلبات الذكاء الاصطناعي عبر خادم التطبيق الآمن باستخدام مفتاح GEMINI_API_KEY.",
      resetData: "إعادة تعيين البيانات الافتراضية",
    },
  },
};
