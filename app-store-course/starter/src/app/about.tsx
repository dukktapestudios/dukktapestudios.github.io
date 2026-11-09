import { StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>One Small Win</Text>
      <Text style={styles.body}>
        This version stores your checklist on this phone. It does not create an account,
        ask for location, or send the list to a server.
      </Text>
      <Text style={styles.body}>
        Before App Store review, replace this paragraph with a link to the privacy policy
        you host. Apple requires that link inside the app and in App Store Connect.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, gap: 12, backgroundColor: "#171b1e" },
  title: { color: "#f0f0e8", fontSize: 28, fontWeight: "700" },
  body: { color: "#f0f0e8", fontSize: 18, lineHeight: 26 },
});
