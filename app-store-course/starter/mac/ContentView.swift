import SwiftUI

// Mac route sample for a local checklist.
// This file was not compiled in Xcode. Menu names in Xcode 27 can differ.
// Follow Apple's distributing documentation and the labels in your Xcode.

struct Win: Identifiable, Codable, Equatable {
    var id: UUID = UUID()
    var text: String
    var done: Bool = false
}

struct ContentView: View {
    @State private var wins: [Win] = []
    @State private var draft = ""
    @State private var message = ""
    private let key = "one-small-win-v1"

    var body: some View {
        NavigationStack {
            List {
                if !message.isEmpty {
                    Text(message)
                }
                if wins.isEmpty {
                    Text("The list is empty.")
                }
                ForEach(wins) { win in
                    HStack {
                        Button(win.text) { toggle(win) }
                            .strikethrough(win.done)
                        Spacer()
                        Button("Remove") { remove(win) }
                    }
                }
            }
            .navigationTitle("One Small Win")
            .safeAreaInset(edge: .bottom) {
                VStack(alignment: .leading, spacing: 8) {
                    TextField("One small win", text: $draft)
                        .textFieldStyle(.roundedBorder)
                    Button("Add win") { add() }
                        .buttonStyle(.borderedProminent)
                }
                .padding()
            }
        }
        .onAppear(perform: load)
    }

    private func add() {
        let clean = draft.trimmingCharacters(in: .whitespacesAndNewlines)
        if clean.isEmpty {
            message = "Type a win first."
            return
        }
        if clean.count > 120 {
            message = "Keep it to 120 characters."
            return
        }
        wins.append(Win(text: clean))
        draft = ""
        message = ""
        save()
    }

    private func toggle(_ win: Win) {
        wins = wins.map { item in
            var copy = item
            if item.id == win.id { copy.done.toggle() }
            return copy
        }
        save()
    }

    private func remove(_ win: Win) {
        wins.removeAll { $0.id == win.id }
        save()
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: key) else { return }
        guard let decoded = try? JSONDecoder().decode([Win].self, from: data) else {
            message = "Saved wins could not be read."
            return
        }
        wins = decoded
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(wins) else {
            message = "The win is on screen. Saving it failed."
            return
        }
        UserDefaults.standard.set(data, forKey: key)
    }
}
