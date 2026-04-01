import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  Alert, ScrollView,
} from "react-native";
import Svg, { Circle, Line, Text as SvgText, Rect } from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/services/apiClient";
import { useAuthStore } from "@/store/authStore";

interface Node { id: string; label: string; x?: number; y?: number; }
interface Edge { source: string; target: string; label: string; }

const NODE_W = 110;
const NODE_H = 40;
const CANVAS_W = 600;
const CANVAS_H = 500;

function layoutNodes(nodes: Node[]): Node[] {
  const cx = CANVAS_W / 2;
  const cy = CANVAS_H / 2;
  const r = Math.min(cx, cy) - 80;
  return nodes.map((n: Node, i: number) => ({
    ...n,
    x: cx + r * Math.cos((2 * Math.PI * i) / nodes.length),
    y: cy + r * Math.sin((2 * Math.PI * i) / nodes.length),
  }));
}

export default function ConceptMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s: any) => s.user);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = user?.isPro ?? false;

  useEffect(() => {
    if (!isPro || !id) { setLoading(false); return; }
    apiClient.post(`/materials/${id}/concept-map`)
      .then(({ data }: { data: { nodes: Node[]; edges: Edge[] } }) => {
        setNodes(layoutNodes(data.nodes || []));
        setEdges(data.edges || []);
      })
      .catch(() => Alert.alert("خطأ", "مش قدرنا ننشئ خريطة المفاهيم"))
      .finally(() => setLoading(false));
  }, [id, isPro]);

  const getNode = (nodeId: string) => nodes.find((n) => n.id === nodeId);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14 pb-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text className="text-textPrimary text-xl font-bold"
          style={{ fontFamily: "Cairo_700Bold" }}>خريطة المفاهيم</Text>
        <View style={{ width: 24 }} />
      </View>

      {!isPro && (
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-surface rounded-3xl p-6 items-center">
            <Ionicons name="lock-closed" size={48} color="#10B981" />
            <Text className="text-textPrimary text-xl font-bold mt-4 text-center"
              style={{ fontFamily: "Cairo_700Bold" }}>ميزة Pro ⚡</Text>
            <Text className="text-textSecondary text-center mt-2"
              style={{ fontFamily: "Cairo_400Regular" }}>
              خريطة المفاهيم متاحة لمشتركي Pro فقط
            </Text>
            <TouchableOpacity className="mt-5 bg-primary rounded-2xl px-8 py-3">
              <Text className="text-white font-bold" style={{ fontFamily: "Cairo_700Bold" }}>
                اشترك في Pro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isPro && loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10B981" size="large" />
          <Text className="text-textSecondary mt-3" style={{ fontFamily: "Cairo_400Regular" }}>
            جاري إنشاء الخريطة...
          </Text>
        </View>
      )}

      {isPro && !loading && nodes.length > 0 && (
        <ScrollView
          horizontal
          contentContainerStyle={{ width: CANVAS_W, height: CANVAS_H }}
          maximumZoomScale={2}
          minimumZoomScale={0.5}
        >
          <Svg width={CANVAS_W} height={CANVAS_H}>
            {/* Edges */}
            {edges.map((edge: Edge, i: number) => {
              const src = getNode(edge.source);
              const tgt = getNode(edge.target);
              if (!src?.x || !tgt?.x) return null;
              const mx = (src.x + tgt.x) / 2;
              const my = (src.y! + tgt.y!) / 2;
              return (
                <React.Fragment key={i}>
                  <Line
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke="#334155" strokeWidth={1.5}
                  />
                  <SvgText x={mx} y={my - 4} fill="#64748B" fontSize={10}
                    textAnchor="middle" fontFamily="Cairo">
                    {edge.label}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {/* Nodes */}
            {nodes.map((node: Node) => (
              <React.Fragment key={node.id}>
                <Rect
                  x={(node.x ?? 0) - NODE_W / 2}
                  y={(node.y ?? 0) - NODE_H / 2}
                  width={NODE_W} height={NODE_H}
                  rx={10} ry={10}
                  fill="#1E293B" stroke="#10B981" strokeWidth={1}
                />
                <SvgText
                  x={node.x} y={(node.y ?? 0) + 5}
                  fill="#F8FAFC" fontSize={11}
                  textAnchor="middle" fontFamily="Cairo">
                  {node.label.slice(0, 14)}
                </SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </ScrollView>
      )}

      {isPro && !loading && nodes.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Text className="text-textSecondary" style={{ fontFamily: "Cairo_400Regular" }}>
            مفيش بيانات كافية لإنشاء الخريطة
          </Text>
        </View>
      )}
    </View>
  );
}
