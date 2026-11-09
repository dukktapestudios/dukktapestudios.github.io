import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Today" }} />
      <Stack.Screen name="list" options={{ title: "All wins" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
    </Stack>
  );
}
