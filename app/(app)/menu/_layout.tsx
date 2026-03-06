import { Stack } from "expo-router";

export default function MenuLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="categories" />
            <Stack.Screen name="items/index" />
            <Stack.Screen name="items/[id]" />
            <Stack.Screen name="ingredients" />
            <Stack.Screen name="stock" />
            <Stack.Screen name="recipes" />
        </Stack>
    );
}
