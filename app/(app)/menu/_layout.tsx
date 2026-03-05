import { Stack } from "expo-router";

export default function MenuLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="items/index" options={{ headerShown: false }} />
            <Stack.Screen name="items/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
