import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRider, getStatusConfig } from '@/types/rider.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    rider: IRider;
    onEdit: (rider: IRider) => void;
    onDelete: (rider: IRider) => void;
    onClose: () => void;
}

export default function RiderDetailSheet({ rider, onEdit, onDelete, onClose }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    const statusCfg = getStatusConfig(rider.status);

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={[s.title, { color: C.text[scheme] }]}>Rider Details</Text>
                <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                    <Ionicons name="close" size={24} color={C.text[scheme]} />
                </TouchableOpacity>
            </View>

            <View style={[s.divider, { backgroundColor: C.border[scheme] }]} />

            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <View style={s.centered}>
                    <View style={[s.avatarWrap, { backgroundColor: C.primary[scheme] + '15' }]}>
                        <Ionicons name="person-circle-outline" size={80} color={C.primary[scheme]} />
                    </View>
                    <Text style={[s.name, { color: C.text[scheme] }]}>{rider.name}</Text>
                    <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <View style={[s.statusDot, { backgroundColor: statusCfg.dot }]} />
                        <Text style={[s.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                    </View>
                </View>

                <View style={s.detailsBox}>
                    <View style={[s.detailRow, { borderBottomColor: C.border[scheme] }]}>
                        <View style={s.detailLabel}>
                            <Ionicons name="call-outline" size={18} color={C.secondary[scheme]} />
                            <Text style={[s.labelText, { color: C.secondary[scheme] }]}>Phone</Text>
                        </View>
                        <Text style={[s.detailValue, { color: C.text[scheme] }]}>{rider.phone}</Text>
                    </View>

                    <View style={[s.detailRow, { borderBottomColor: C.border[scheme] }]}>
                        <View style={s.detailLabel}>
                            <Ionicons name="calendar-outline" size={18} color={C.secondary[scheme]} />
                            <Text style={[s.labelText, { color: C.secondary[scheme] }]}>Joined On</Text>
                        </View>
                        <Text style={[s.detailValue, { color: C.text[scheme] }]}>
                            {new Date(rider.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </Text>
                    </View>

                    <View style={[s.detailRow, { borderBottomColor: C.border[scheme] }]}>
                        <View style={s.detailLabel}>
                            <Ionicons name="finger-print-outline" size={18} color={C.secondary[scheme]} />
                            <Text style={[s.labelText, { color: C.secondary[scheme] }]}>Rider ID</Text>
                        </View>
                        <Text style={[s.detailValue, { color: C.secondary[scheme] }]}>{rider.id}</Text>
                    </View>
                </View>

                <View style={s.actions}>
                    <TouchableOpacity
                        onPress={() => onEdit(rider)}
                        style={[s.editBtn, { backgroundColor: C.primary[scheme] }]}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                        <Text style={s.btnTextText}>Edit Rider</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onDelete(rider)}
                        style={[s.deleteBtn, { borderColor: '#ef4444' }]}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        <Text style={[s.btnTextText, { color: '#ef4444' }]}>Delete Rider</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    closeBtn: {
        padding: 4,
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    content: {
        paddingBottom: 40,
    },
    centered: {
        alignItems: 'center',
        marginBottom: 30,
        gap: 12,
    },
    avatarWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 16,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    detailsBox: {
        gap: 0,
        marginBottom: 40,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    editBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    deleteBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        borderWidth: 1.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    btnTextText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
    },
});
