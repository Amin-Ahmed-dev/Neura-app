import React, { useState } from "react";
import {
  View, Text, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { materialService, Material, OcrResult } from "@/services/materialService";
import { useUiStore } from "@/store/uiStore";
import { BottomSheet } from "@/components/ui/BottomSheet";

const SUBJECTS = ["عام", "رياضيات", "فيزياء", "كيمياء", "أحياء", "تاريخ", "جغرافيا", "لغة عربية"];

interface Props {
  visible: boolean;
  onClose: () => void;
  onUploaded: (mat: Material) => void;
}

type Step = "pick" | "form" | "ocr" | "uploading";

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  isImage: boolean;
}

export function UploadSheet({ visible, onClose, onUploaded }: Props) {
  const isOffline = useUiStore((s: any) => s.isOffline);
  const [step, setStep] = useState<Step>("pick");
  const [file, setFile] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("عام");
  const [progress, setProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);

  const reset = () => {
    setStep("pick");
    setFile(null);
    setTitle("");
    setSubject("عام");
    setProgress(0);
    setOcrResult(null);
    setOcrText("");
  };

  const handleClose = () => { reset(); onClose(); };

  const pickPdf = async () => {
    if (isOffline) { Alert.alert("بدون إنترنت", "محتاج إنترنت لرفع الملفات"); return; }
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setFile({ uri: asset.uri, name: asset.name, mimeType: "application/pdf", isImage: false });
    setTitle(asset.name.replace(/\.pdf$/i, ""));
    setStep("form");
  };

  const pickImage = async (source: "camera" | "gallery") => {
    if (isOffline) { Alert.alert("بدون إنترنت", "محتاج إنترنت لرفع الملفات"); return; }
    const fn = source === "camera" ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const name = asset.fileName || `photo_${Date.now()}.jpg`;
    const mime = asset.mimeType || "image/jpeg";
    setFile({ uri: asset.uri, name, mimeType: mime, isImage: true });
    setTitle(name.replace(/\.[^.]+$/, ""));
    // Trigger OCR for images
    setStep("ocr");
    setOcrLoading(true);
    try {
      const res = await materialService.ocr(asset.uri, name, mime);
      setOcrResult(res);
      setOcrText(res.extracted_text);
    } catch {
      Alert.alert("خطأ في OCR", "مش قدرنا نقرأ الصورة، هترفعها كصورة عادية");
      setStep("form");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStep("uploading");
    setProgress(0);
    try {
      const result = await materialService.upload(
        file.uri, file.name, file.mimeType, title.trim() || file.name, subject,
        (pct) => setProgress(pct)
      );
      // Optimistic material object
      const mat: Material = {
        id: result.material_id,
        title: title.trim() || file.name,
        subject,
        page_count: 0,
        processing_status: result.instant ? "cached" : "pending",
        created_at: new Date().toISOString(),
      };
      onUploaded(mat);
      reset();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "فشل الرفع، حاول تاني";
      Alert.alert("خطأ في الرفع", msg);
      setStep("form");
    }
  };

  const getTitle = () => {
    if (step === "pick") return "رفع مادة";
    if (step === "ocr") return "النص اللي استخرجناه من صورتك";
    if (step === "form") return "تفاصيل المادة";
    return "جاري الرفع...";
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={getTitle()}
      scrollable={step !== "uploading"}
    >
      {/* Step: pick source */}
      {step === "pick" && (
        <>
          <PickOption icon="document-outline" label="PDF من الجهاز" onPress={pickPdf} />
          <PickOption icon="camera-outline" label="صورة من الكاميرا" onPress={() => pickImage("camera")} />
          <PickOption icon="images-outline" label="صورة من الألبوم" onPress={() => pickImage("gallery")} />
        </>
      )}

      {/* Step: OCR review */}
      {step === "ocr" && (
        <>
          {ocrLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#10B981" size="large" />
              <Text className="text-textSecondary mt-3" style={{ fontFamily: "Cairo_400Regular" }}>
                جاري قراءة الصورة...
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-textSecondary text-xs text-right mb-2"
                style={{ fontFamily: "Cairo_400Regular" }}>
                الدقة ممكن تتأثر بجودة الكتابة
                {ocrResult ? ` — دقة: ${Math.round(ocrResult.confidence * 100)}%` : ""}
              </Text>
              <TextInput
                value={ocrText}
                onChangeText={setOcrText}
                multiline
                numberOfLines={6}
                className="bg-background text-textPrimary rounded-xl px-4 py-3 text-right mb-4"
                style={{ fontFamily: "Cairo_400Regular", minHeight: 120, textAlignVertical: "top" }}
                placeholder="النص المستخرج..."
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity
                className="bg-primary rounded-2xl py-3 items-center"
                onPress={() => setStep("form")}
              >
                <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                  تمام، اشتغل عليه
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {/* Step: form */}
      {step === "form" && (
        <>
          <Text className="text-textSecondary text-sm text-right mb-1"
            style={{ fontFamily: "Cairo_400Regular" }}>اسم المادة</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="bg-background text-textPrimary rounded-xl px-4 py-3 text-right mb-4"
            style={{ fontFamily: "Cairo_400Regular" }}
            placeholder="اسم المادة"
            placeholderTextColor="#94A3B8"
          />
          <Text className="text-textSecondary text-sm text-right mb-2"
            style={{ fontFamily: "Cairo_400Regular" }}>المادة الدراسية</Text>
          <View className="flex-row flex-wrap gap-2 justify-end mb-5">
            {SUBJECTS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full border ${
                  subject === s ? "bg-primary border-primary" : "bg-background border-white/10"
                }`}
              >
                <Text
                  className={subject === s ? "text-white font-bold" : "text-textSecondary"}
                  style={{ fontFamily: "Cairo_700Bold", fontSize: 13 }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            className="bg-primary rounded-2xl py-3 items-center"
            onPress={handleUpload}
            disabled={!title.trim()}
          >
            <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>ارفع</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Step: uploading */}
      {step === "uploading" && (
        <View className="items-center py-8">
          <ActivityIndicator color="#10B981" size="large" />
          <Text className="text-textPrimary font-bold mt-4 mb-2"
            style={{ fontFamily: "Cairo_700Bold" }}>جاري الرفع...</Text>
          <View className="w-full h-2 bg-background rounded-full overflow-hidden">
            <View className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
          </View>
          <Text className="text-textSecondary text-sm mt-2"
            style={{ fontFamily: "Cairo_400Regular" }}>{progress}%</Text>
        </View>
      )}
    </BottomSheet>
  );
}

function PickOption({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-end gap-3 bg-background rounded-2xl px-4 py-4 mb-3"
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text className="text-textPrimary text-base" style={{ fontFamily: "Cairo_400Regular" }}>{label}</Text>
      <Ionicons name={icon} size={22} color="#10B981" />
    </TouchableOpacity>
  );
}
