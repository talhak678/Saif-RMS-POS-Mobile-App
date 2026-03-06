import { useTheme } from '@/src/context/ThemeContext';
import { C } from '@/theme/colors';
import { IRider, getStatusConfig } from '@/types/rider.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    rider: IRider;
    onToggleStatus: (rider: IRider) => void;
    onView: (rider: IRider) => void;
    onEdit: (rider: IRider) => void;
    onDelete: (rider: IRider) => void;
}

export default function RiderCard({ rider, onToggleStatus, onView, onEdit, onDelete }: Props) {
    const { isDark } = useTheme();
    const scheme = isDark ? 'dark' : 'light';
    const statusCfg = getStatusConfig(rider.status);
    const canToggle = rider.status !== 'OFFLINE';

    return (
        <View style={[s.card, { backgroundColor: C.cardBg[scheme], borderColor: C.border[scheme] }]}>
            <View style={s.topRow}>
                <View style={s.personIcon}>
                    <Ionicons name="person-circle-outline" size={44} color={C.secondary[scheme]} />
                </View>
                <View style={s.info}>
                    <View style={s.nameBadgeRow}>
                        <Text style={[s.name, { color: C.text[scheme] }]} numberOfLines={1}>{rider.name}</Text>
                        <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
                            <View style={[s.statusDot, { backgroundColor: statusCfg.dot }]} />
                            <Text style={[s.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                        </View>
                    </View>
                    <Text style={[s.phone, { color: C.secondary[scheme] }]}>📞 {rider.phone}</Text>
                    <Text style={[s.date, { color: C.secondary[scheme] }]}>
                        Joined: {new Date(rider.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <View style={[s.actionRow, { borderTopColor: C.border[scheme] }]}>
                <TouchableOpacity
                    disabled={!canToggle}
                    onPress={() => onToggleStatus(rider)}
                    style={[s.actionBtn, { opacity: canToggle ? 1 : 0.4 }]}
                >
                    <Ionicons name="refresh-circle-outline" size={24} color={canToggle ? C.primary[scheme] : C.secondary[scheme]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onView(rider)} style={s.actionBtn}>
                    <Ionicons name="eye-outline" size={20} color={C.text[scheme]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onEdit(rider)} style={s.actionBtn}>
                    <Ionicons name="create-outline" size={20} color={C.secondary[scheme]} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onDelete(rider)} style={s.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    topRow: {
        flexDirection: 'row',
        gap: 12,
    },
    personIcon: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    nameBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    phone: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        fontSize: 11,
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
