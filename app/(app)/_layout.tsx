import { Slot } from "expo-router";

// Passthrough layout — (app) is a transparent group.
// This file is required so Expo Router recognises (app) as a proper layout segment.
export default function AppLayout() {
    return <Slot />;
}
