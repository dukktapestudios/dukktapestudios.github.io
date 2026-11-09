import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addWin, openWins, parseWins, type Win } from "../lib/wins";

const STORAGE_KEY = "one-small-win-v1";

export default function TodayScreen() {
  const [wins, setWins] = useState<Win[]>([]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("Reading saved wins…");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        setWins(parseWins(raw));
        setMessage("");
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setMessage("This phone could not read saved wins. You can still add one for this session.");
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(next: Win[]) {
    setWins(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMessage("");
    } catch {
      setMessage("The win is on screen. Saving it on this phone failed.");
    }
  }

  const remaining = openWins(wins);

  return (
    <View style={styles.page}>
      <Text style={styles.count} accessibilityLiveRegion="polite">
        {ready ? `${remaining.length} still open` : "Reading saved wins…"}
      </Text>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      {ready && remaining.length === 0 ? (
        <Text style={styles.empty}>No open wins. Add one small thing you can finish.</Text>
      ) : null}
      {remaining[0] ? (
        <Text style={styles.hero}>{remaining[0].text}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder="One small win"
        accessibilityLabel="Win to add"
        maxLength={140}
      />
      <Pressable
        style={styles.button}
        accessibilityRole="button"
        onPress={() => {
          const result = addWin(wins, draft, Date.now());
          if (!result.ok) {
            setMessage(result.error === "long" ? "Keep it to 120 characters." : "Type a win first.");
            return;
          }
          setDraft("");
          void save(result.list);
        }}
      >
        <Text style={styles.buttonText}>Add win</Text>
      </Pressable>
      <Link href="/list" style={styles.link}>All wins</Link>
      <Link href="/about" style={styles.link}>About this app</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 12, backgroundColor: "#171b1e" },
  count: { color: "#efb671", fontSize: 16, fontWeight: "700" },
  note: { color: "#f0f0e8", fontSize: 16 },
  empty: { color: "#f0f0e8", fontSize: 18 },
  hero: { color: "#f0f0e8", fontSize: 28, fontWeight: "700" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#3a4143",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#f0f0e8",
    backgroundColor: "#22282c",
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#efb671",
  },
  buttonText: { color: "#171b1e", fontWeight: "700", fontSize: 16 },
  link: { color: "#efb671", fontSize: 16, paddingVertical: 8 },
});
