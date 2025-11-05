import SwiftUI

struct ZoneIndicatorView: View {
    @EnvironmentObject var hrMonitor: HRMonitor

    var body: some View {
        let zone = hrMonitor.getCurrentZone()

        HStack(spacing: 8) {
            Text(zone.emoji)
                .font(.title2)

            VStack(alignment: .leading, spacing: 2) {
                Text(zone.rawValue)
                    .font(.headline)
                    .foregroundColor(zone.color)

                Text(zone.range)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            Spacer()
        }
        .padding()
        .background(zone.color.opacity(0.1))
        .cornerRadius(8)
    }
}

struct ZoneIndicatorView_Previews: PreviewProvider {
    static var previews: some View {
        ZoneIndicatorView()
            .environmentObject(HRMonitor())
    }
}
