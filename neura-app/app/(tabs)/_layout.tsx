import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthGuard } from "@/hooks/useAuthGuard";

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICON: Record<string, { active: IconName; inactive: IconName; label: string }> = {
  home:      { active: "home",              inactive: "home-outline",             label: "الرئيسية" },
  focus:     { active: "timer",             inactive: "timer-outline",            label: "التركيز" },
  tasks:     { active: "checkmark-circle",  inactive: "checkmark-circle-outline", label: "مهامي" },
  chat:      { active: "chatbubble",        inactive: "chatbubble-outline",       label: "نيورا" },
  materials: { active: "book",              inactive: "book-outline",             label: "موادي" },
  profile:   { active: "person-circle",     inactive: "person-circle-outline",    label: "أنا" },
};

export default function TabsLayout() {
  useAuthGuard(); // Redirect to welcome if not authenticated

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: "#1E293B", borderTopColor: "#0F172A", height: 64 },
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarLabelStyle: { fontFamily: "Cairo", fontSize: 11, marginBottom: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          const tab = TAB_ICON[route.name];
          return <Ionicons name={focused ? tab.active : tab.inactive} size={size} color={color} />;
        },
        tabBarLabel: TAB_ICON[route.name]?.label ?? route.name,
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="focus" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="materials" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
