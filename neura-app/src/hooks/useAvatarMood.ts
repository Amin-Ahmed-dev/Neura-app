import { useMemo } from "react";
import { useStudyStore } from "@/store/studyStore";

export type AvatarMood = "happy" | "neutral" | "sad" | "excited";

interface MoodConfig {
  mood: AvatarMood;
  emoji: string;
  glowColor: string | null;
  messages: string[];
}

const MOOD_MESSAGES: Record<AvatarMood, string[]> = {
  happy: [
    "أنت بتعمل حاجة عظيمة! كمّل كده 💪",
    "السلسلة بتاعتك قوية جداً، متوقفش! 🔥",
    "كل يوم بتذاكر بتبقى أقوى من امبارح 🌟",
    "ده مش بس مذاكرة، ده بناء مستقبل 🚀",
    "فخور بيك! استمر وهتوصل لأي حاجة 🏆",
  ],
  neutral: [
    "يلا نبدأ النهارده بقوة! 💡",
    "كل خطوة صغيرة بتقربك من هدفك 🎯",
    "ابدأ بمهمة واحدة بس، وهتحس بالفرق 📚",
    "النهارده فرصة جديدة تبني عادة جديدة ✨",
    "أنا هنا معاك، يلا نذاكر! 🤝",
  ],
  sad: [
    "مش مشكلة، كلنا بنعدي أيام صعبة 🌧️",
    "ابدأ من الأول، المهم ترجع 💙",
    "يوم واحد مش بيكسر العادة، يلا ارجع! 🔄",
    "أنا واثق فيك، تقدر تعوض اللي فات 💪",
    "الفشل جزء من الرحلة، المهم تكمل 🌱",
  ],
  excited: [
    "ده رقم قياسي جديد! أنت نجم! 🌟⭐",
    "مبروك! وصلت لمستوى جديد 🎉🏆",
    "أنت بتكسر حدودك كل يوم! 🚀💥",
    "ده إنجاز حقيقي، افتخر بنفسك! 🎊",
    "الاستمرارية دي هي السر، وأنت عارفها! 🔑",
  ],
};

export function useAvatarMood(): MoodConfig {
  const { currentStreak, lastActiveDate } = useStudyStore();

  return useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    let mood: AvatarMood;

    if (currentStreak >= 7) {
      mood = "excited";
    } else if (currentStreak >= 3) {
      mood = "happy";
    } else if (lastActiveDate && lastActiveDate < yesterday) {
      mood = "sad";
    } else {
      mood = "neutral";
    }

    const glowMap: Record<AvatarMood, string | null> = {
      happy: "#10B981",
      neutral: null,
      sad: null,
      excited: "#FBBF24",
    };

    const emojiMap: Record<AvatarMood, string> = {
      happy: "😄",
      neutral: "🙂",
      sad: "😔",
      excited: "🤩",
    };

    return {
      mood,
      emoji: emojiMap[mood],
      glowColor: glowMap[mood],
      messages: MOOD_MESSAGES[mood],
    };
  }, [currentStreak, lastActiveDate]);
}
