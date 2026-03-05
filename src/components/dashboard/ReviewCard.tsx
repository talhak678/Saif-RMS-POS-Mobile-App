import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReviewCardProps {
    review: { id: string; rating: number; comment: string | null; customerName: string; createdAt: string };
}

function Stars({ rating }: { rating: number }) {
    return (
        <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={{ fontSize: 13, color: i <= rating ? "#f59e0b" : "#4B5563" }}>★</Text>
            ))}
        </View>
    );
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const { colors } = useTheme();
    return (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.topRow}>
                <View>
                    <Text style={[s.name, { color: colors.text }]}>{review.customerName}</Text>
                    <Stars rating={review.rating} />
                </View>
                <Text style={[s.date, { color: colors.secondary }]}>{formatDate(review.createdAt)}</Text>
            </View>
            {review.comment
                ? <Text style={[s.comment, { color: colors.text }]}>"{review.comment}"</Text>
                : <Text style={[s.noComment, { color: colors.secondary }]}>No comment</Text>
            }
        </View>
    );
}

const s = StyleSheet.create({
    card: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    name: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
    date: { fontSize: 11 },
    comment: { fontSize: 13, fontStyle: "italic", lineHeight: 20 },
    noComment: { fontSize: 13 },
});
