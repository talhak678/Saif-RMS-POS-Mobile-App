import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        comment: string | null;
        customerName: string;
        createdAt: string;
    };
}

function Stars({ rating }: { rating: number }) {
    return (
        <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Text key={i} style={{ fontSize: 13, color: i <= rating ? "#f59e0b" : "#D1D5DB" }}>
                    ★
                </Text>
            ))}
        </View>
    );
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ReviewCard({ review }: ReviewCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.name}>{review.customerName}</Text>
                    <Stars rating={review.rating} />
                </View>
                <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
            </View>
            {review.comment ? (
                <Text style={styles.comment}>"{review.comment}"</Text>
            ) : (
                <Text style={styles.noComment}>No comment</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 1,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    name: { fontSize: 14, fontWeight: "700", color: Colors.light.text, marginBottom: 4 },
    date: { fontSize: 11, color: Colors.light.secondary },
    comment: { fontSize: 13, color: Colors.light.text, fontStyle: "italic", lineHeight: 20 },
    noComment: { fontSize: 13, color: Colors.light.secondary },
});
