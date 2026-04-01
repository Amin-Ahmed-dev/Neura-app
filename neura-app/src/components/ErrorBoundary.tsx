import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.resetError);
      }

      return (
        <View className="flex-1 bg-background items-center justify-center px-8">
          <Ionicons name="warning-outline" size={64} color="#EF4444" />
          <Text className="text-textPrimary text-xl font-bold text-center mt-6 mb-2"
            style={{ fontFamily: "Cairo_700Bold" }}>
            حصل خطأ غير متوقع
          </Text>
          <Text className="text-textSecondary text-center mb-8 leading-7"
            style={{ fontFamily: "Cairo_400Regular" }}>
            عذراً، حصلت مشكلة. جرب تاني أو أعد تشغيل التطبيق.
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-2xl"
            onPress={this.resetError}
          >
            <Text className="text-white font-bold"
              style={{ fontFamily: "Cairo_700Bold" }}>
              حاول تاني 🔄
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
