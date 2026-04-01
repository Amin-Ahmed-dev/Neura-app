import React from "react";
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** @deprecated use message */
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Alias for confirmVariant="danger" */
  isDanger?: boolean;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  body,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  isDanger = false,
  confirmVariant,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const variant = confirmVariant ?? (isDanger ? "danger" : "primary");
  const displayMessage = message ?? body;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-surface w-full rounded-3xl p-6">
              <Text
                className="text-textPrimary text-xl font-bold text-right mb-2"
                style={{ fontFamily: "Cairo_700Bold" }}
              >
                {title}
              </Text>

              {displayMessage && (
                <Text
                  className="text-textSecondary text-base text-right mb-4 leading-7"
                  style={{ fontFamily: "Cairo_400Regular" }}
                >
                  {displayMessage}
                </Text>
              )}

              {/* Extra content (e.g., password input) */}
              {children && <View className="mb-4">{children}</View>}

              <View className="flex-row gap-3 justify-end">
                <TouchableOpacity
                  className="flex-1 border border-background rounded-2xl py-3 items-center"
                  onPress={onCancel}
                >
                  <Text
                    className="text-textSecondary font-bold"
                    style={{ fontFamily: "Cairo_700Bold" }}
                  >
                    {cancelLabel}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 rounded-2xl py-3 items-center ${
                    variant === "danger"
                      ? "bg-red-500/20 border border-red-500/40"
                      : "bg-primary"
                  }`}
                  onPress={onConfirm}
                >
                  <Text
                    className={`font-bold ${variant === "danger" ? "text-red-400" : "text-white"}`}
                    style={{ fontFamily: "Cairo_700Bold" }}
                  >
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
