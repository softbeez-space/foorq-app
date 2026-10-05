import WifiManager from 'react-native-wifi-reborn';

export async function getCurrentWifiSSID(): Promise<string | null> {
  try {
    const ssid = await WifiManager.getCurrentWifiSSID();
    return ssid || null;
  } catch {
    return null;
  }
}
