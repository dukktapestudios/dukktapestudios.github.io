import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseWins, removeWin, toggleWin, type Win } from "../lib/wins";

const STORAGE_KEY = "one-small-win-v1";

export default function ListScreen() {
  const [wins, setWins] = useState<Win[]>([]);
  const [message, setMessage] = useState("Reading saved wins…");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        setWins(parseWins(raw));
        setMessage("");
      })
      .catch(() => setMessage("Could not read saved wins."));
  }, []);

  async function save(next: Win[]) {
    setWins(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setMessage("The change is on screen. Saving it failed.");
    }
  }

  return (
    <View style={styles.page}>
      {message ? <Text style={styles.note}>{message}</Text> : null}
      {wins.length === 0 ? <Text style={styles.empty}>The list is empty.</Text> : null}
      {wins.map((win) => (
        <View key={win.id} style={styles.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${win.done ? "Mark not done" : "Mark done"}: ${win.text}`}
            onPress={() => void save(toggleWin(wins, win.id))}
            style={styles.grow}
          >
            <Text style={win.done ? styles.done : styles.text}>{win.text}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${win.text}`}
            onPress={() => void save(removeWin(wins, win.id))}
          >
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 10, backgroundColor: "#171b1e" },
  note: { color: "#f0f0e8" },
  empty: { color: "#f0f0e8", fontSize: 18 },
  row: { flexDirection: "row", gap: 12, alignItems: "center", minHeight: 48 },
  grow: { flex: 1 },
  text: { color: "#f0f0e8", fontSize: 18 },
  done: { color: "#b4b4b4", fontSize: 18, textDecorationLine: "line-through" },
  remove: { color: "#efb671", fontSize: 16, padding: 8 },
});
