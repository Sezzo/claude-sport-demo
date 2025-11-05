import SwiftUI

struct HRDisplayView: View {
    @EnvironmentObject var hrMonitor: HRMonitor

    var body: some View {
        VStack(spacing: 4) {
            Text("❤️")
                .font(.title)

            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text("\(hrMonitor.currentBPM)")
                    .font(.system(size: 50, weight: .bold, design: .rounded))
                    .foregroundColor(hrMonitor.getCurrentZone().color)

                Text("BPM")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text("\(hrMonitor.getPercentOfMax())% of max")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct HRDisplayView_Previews: PreviewProvider {
    static var previews: some View {
        HRDisplayView()
            .environmentObject(HRMonitor())
    }
}
