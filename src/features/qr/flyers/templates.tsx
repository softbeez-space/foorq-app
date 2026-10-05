import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { fontFamilies } from '@/ui/theme/tokens';

export interface FlyerProps {
  qrValue: string;
  fg: string;
  bg: string;
  logoUri?: string;
  restaurantName?: string;
}

export interface FlyerMeta {
  id: number;
  name: string;
  file: string;
}

const W = 450;
const H = 636;

function Code({ qrValue, fg, bg, logoUri, size }: FlyerProps & { size: number }) {
  return (
    <View style={{ backgroundColor: '#FFFFFF', padding: 12 }}>
      <QRCode
        value={qrValue}
        size={size}
        color={fg}
        backgroundColor={bg}
        ecl="M"
        logo={logoUri ? { uri: logoUri } : undefined}
        logoSize={Math.round(size * 0.22)}
        logoBackgroundColor={bg}
      />
    </View>
  );
}

function Steps({ items, color, sub }: { items: [string, string][]; color: string; sub: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
      {items.map(([n, title]) => (
        <View key={n} style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color, opacity: 0.55 }}>{n}</Text>
          <Text style={{ fontSize: 12.5, fontWeight: '800', color, marginTop: 4, fontFamily: fontFamilies.ui }}>
            {title}
          </Text>
          <Text style={{ fontSize: 10.5, color, opacity: 0.6, marginTop: 2 }}>{sub}</Text>
        </View>
      ))}
    </View>
  );
}

const base = StyleSheet.create({
  page: { width: W, height: H, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, paddingVertical: 40 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 3, fontFamily: fontFamilies.ui },
  h1: { textAlign: 'center', fontFamily: fontFamilies.display, fontWeight: '700' },
  sub: { textAlign: 'center', fontSize: 13, fontFamily: fontFamilies.ui, marginTop: 10 },
  foot: { textAlign: 'center', fontSize: 11, fontFamily: fontFamilies.ui },
  hairline: { width: '100%', height: 1, marginBottom: 12 },
});

/* 1 — Outline Pop */
function F1(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#F3EEE1' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#1A161180' }]}>{p.restaurantName || 'DINE-IN MENU'}</Text>
        <Text style={[base.h1, { fontSize: 46, color: '#1A1611', marginTop: 12 }]}>Scan for{'\n'}the full menu</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 1.5, borderColor: '#1A1611', borderRadius: 20 }}>
          <Code {...p} size={216} />
        </View>
        <Text style={[base.sub, { color: '#1A161199' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['1', 'Scan'], ['2', 'Browse'], ['3', 'Order']]} color="#1A1611" sub="" />
        <View style={[base.hairline, { backgroundColor: '#1A16111A' }]} />
        <Text style={[base.foot, { color: '#1A161173' }]}>Thank you for dining with us</Text>
      </View>
    </View>
  );
}

/* 2 — Pop Yellow */
function F2(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#FFC42E' }]}>
      <View style={{ alignItems: 'center' }}>
        <View style={{ backgroundColor: '#141414', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6 }}>
          <Text style={[base.eyebrow, { color: '#FFC42E' }]}>{p.restaurantName || 'DINE-IN MENU'}</Text>
        </View>
        <Text style={[base.h1, { fontSize: 52, color: '#141414', marginTop: 14, lineHeight: 50 }]}>
          SCAN.{'\n'}EAT.{'\n'}REPEAT.
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 2, borderColor: '#141414', borderRadius: 20 }}>
          <Code {...p} size={212} />
        </View>
        <Text style={[base.sub, { color: '#14141499', fontWeight: '700' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['1', 'Scan'], ['2', 'Browse'], ['3', 'Order']]} color="#141414" sub="" />
        <View style={[base.hairline, { backgroundColor: '#14141426' }]} />
        <Text style={[base.foot, { color: '#1414148C', fontWeight: '700' }]}>Thank you — enjoy every bite</Text>
      </View>
    </View>
  );
}

/* 3 — Clay Warm */
function F3(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#C8502E' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#FFF7EEB3' }]}>{p.restaurantName || 'GOOD FOOD MOOD'}</Text>
        <Text style={[base.h1, { fontSize: 48, color: '#FFF7EE', marginTop: 12 }]}>Hungry?{'\n'}Start here.</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderRadius: 20, overflow: 'hidden' }}>
          <Code {...p} size={220} />
        </View>
        <Text style={[base.sub, { color: '#FFF7EECC', fontWeight: '600' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['1', 'Scan QR'], ['2', 'Pick dishes'], ['3', 'Enjoy']]} color="#FFF7EE" sub="" />
        <View style={[base.hairline, { backgroundColor: '#FFFFFF33' }]} />
        <Text style={[base.foot, { color: '#FFF7EEB3' }]}>Thank you for dining with us</Text>
      </View>
    </View>
  );
}

/* 4 — Noir Gold */
function F4(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#111110' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#C9A24C' }]}>{p.restaurantName || 'EVENING MENU'}</Text>
        <Text style={[base.h1, { fontSize: 40, color: '#F2EAD8', marginTop: 14, fontStyle: 'italic', fontWeight: '400' }]}>
          Dinner is served,{'\n'}menu within.
        </Text>
        <View style={{ width: 64, height: 1, backgroundColor: '#C9A24C99', marginTop: 18 }} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 1, borderColor: '#C9A24C', borderRadius: 20 }}>
          <Code {...p} size={212} />
        </View>
        <Text style={[base.sub, { color: '#F2EAD88C' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Text style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 2, color: '#C9A24CCC' }}>
          SCAN · BROWSE · ORDER
        </Text>
        <View style={[base.hairline, { backgroundColor: '#FFFFFF1A', marginTop: 14 }]} />
        <Text style={[base.foot, { color: '#F2EAD873' }]}>Table service</Text>
      </View>
    </View>
  );
}

/* 5 — Forest Night */
function F5(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#0D3B2E' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#9DC9A8' }]}>{p.restaurantName || "TONIGHT'S MENU"}</Text>
        <Text style={[base.h1, { fontSize: 44, color: '#F3EFE3', marginTop: 12 }]}>Take a look at{'\n'}what&apos;s inside</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderRadius: 20, overflow: 'hidden' }}>
          <Code {...p} size={220} />
        </View>
        <Text style={[base.sub, { color: '#F3EFE399', fontWeight: '600' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['01', 'Scan code'], ['02', 'Browse menu'], ['03', 'Order easy']]} color="#F3EFE3" sub="" />
        <View style={[base.hairline, { backgroundColor: '#FFFFFF26' }]} />
        <Text style={[base.foot, { color: '#F3EFE380' }]}>Thank you for dining with us</Text>
      </View>
    </View>
  );
}

/* 6 — Sunday Clean */
function F6(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#FFFFFF' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#11111073' }]}>{p.restaurantName || 'OUR MENU'}</Text>
        <Text style={[base.h1, { fontSize: 44, color: '#111110', marginTop: 12 }]}>Scan to{'\n'}View Menu</Text>
        <Text style={[base.sub, { color: '#1111108C' }]}>Point your camera to scan</Text>
      </View>
      <View style={{ borderWidth: 1.5, borderColor: '#111110', borderRadius: 20 }}>
        <Code {...p} size={224} />
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['1', 'Scan QR'], ['2', 'Browse'], ['3', 'Order']]} color="#111110" sub="" />
        <View style={[base.hairline, { backgroundColor: '#1111101A' }]} />
        <Text style={[base.foot, { color: '#11111073' }]}>Thank you for dining with us</Text>
      </View>
    </View>
  );
}

/* 7 — Sunday Midnight */
function F7(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#141414' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#CDEB4A' }]}>{p.restaurantName || 'OUR MENU'}</Text>
        <Text style={[base.h1, { fontSize: 42, color: '#FFFFFF', marginTop: 12 }]}>Scan to{'\n'}View Menu</Text>
        <Text style={[base.sub, { color: '#FFFFFF8C' }]}>Point your camera to scan</Text>
      </View>
      <View style={{ borderRadius: 20, overflow: 'hidden' }}>
        <Code {...p} size={224} />
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['1', 'Scan QR'], ['2', 'Browse'], ['3', 'Order']]} color="#FFFFFF" sub="" />
        <View style={[base.hairline, { backgroundColor: '#FFFFFF1A' }]} />
        <Text style={[base.foot, { color: '#FFFFFF73' }]}>Thank you for dining with us</Text>
      </View>
    </View>
  );
}

/* 8 — Sunday Heritage */
function F8(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#FAF6EF', borderWidth: 0 }]}>
      <View
        style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 1, borderColor: '#B9975B66', borderRadius: 10 }}
        pointerEvents="none"
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#8A7A5B', fontFamily: fontFamilies.display }}>
          {p.restaurantName || 'Our menu'}
        </Text>
        <Text style={[base.h1, { fontSize: 40, color: '#1B1B18', marginTop: 8, fontWeight: '400' }]}>
          Scan to{'\n'}View Menu
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 1, borderColor: '#B9975B99', borderRadius: 20 }}>
          <Code {...p} size={220} />
        </View>
        <Text style={[base.sub, { color: '#1B1B1899' }]}>Scan with your phone camera</Text>
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Text style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 2, color: '#1B1B1899' }}>
          SCAN · BROWSE · ORDER
        </Text>
        <View style={[base.hairline, { backgroundColor: '#B9975B4D', marginTop: 14 }]} />
        <Text style={[base.foot, { color: '#1B1B1873' }]}>Our team is happy to help</Text>
      </View>
    </View>
  );
}

/* 9 — Poster Pop */
function F9(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#FFF6EC' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={[base.eyebrow, { color: '#16130E80' }]}>{p.restaurantName || 'OUR MENU'}</Text>
        <Text style={[base.h1, { fontSize: 80, color: '#16130E', marginTop: 6 }]}>MENU</Text>
        <View style={{ backgroundColor: '#FF4D00', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 }}>
          <Text style={[base.eyebrow, { color: '#FFF' }]}>SCAN FOR FULL MENU</Text>
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 1.5, borderColor: '#16130E', borderRadius: 20 }}>
          <Code {...p} size={224} />
        </View>
        <Text style={[base.sub, { color: '#16130E8C', fontWeight: '600' }]}>Point your camera to scan</Text>
      </View>
      <View style={{ width: '100%' }}>
        <Steps items={[['01', 'Scan'], ['02', 'Browse'], ['03', 'Order']]} color="#16130E" sub="" />
        <View style={[base.hairline, { backgroundColor: '#16130E1A' }]} />
        <Text style={[base.foot, { color: '#16130E73' }]}>For our dine-in guests</Text>
      </View>
    </View>
  );
}

/* 10 — Bistro Serif */
function F10(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#EDF1E8' }]}>
      <View
        style={{ position: 'absolute', top: 12, left: 12, right: 12, bottom: 12, borderWidth: 1, borderColor: '#2F5D3A40', borderRadius: 10 }}
        pointerEvents="none"
      />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#2F5D3A', fontFamily: fontFamilies.display }}>
          {p.restaurantName || 'Bienvenue — our menu'}
        </Text>
        <Text style={[base.h1, { fontSize: 40, color: '#20301F', marginTop: 8, fontWeight: '400' }]}>
          View our{'\n'}seasonal menu
        </Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ borderWidth: 1, borderColor: '#2F5D3A80', borderRadius: 20 }}>
          <Code {...p} size={220} />
        </View>
        <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#20301F99', marginTop: 10, fontFamily: fontFamilies.display }}>
          one scan, the whole table
        </Text>
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Text style={{ fontSize: 11.5, fontWeight: '800', letterSpacing: 2, color: '#20301F99' }}>
          SCAN · BROWSE · ORDER
        </Text>
        <View style={[base.hairline, { backgroundColor: '#2F5D3A33', marginTop: 14 }]} />
        <Text style={[base.foot, { color: '#20301F73' }]}>Our team is happy to help</Text>
      </View>
    </View>
  );
}

/* 11 — Ticket Mono */
function F11(p: FlyerProps) {
  return (
    <View style={[base.page, { backgroundColor: '#FFFFFF' }]}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 3, color: '#11111073', fontFamily: fontFamilies.mono }}>
          {p.restaurantName || '*** OUR MENU ***'}
        </Text>
        <Text style={{ fontSize: 38, fontWeight: '800', color: '#111110', marginTop: 10, fontFamily: fontFamilies.mono }}>
          {'< SCAN ME >'}
        </Text>
        <Text style={{ fontSize: 12, color: '#1111108C', marginTop: 6, fontFamily: fontFamilies.mono }}>
          --- full menu inside ---
        </Text>
      </View>
      <View style={{ borderWidth: 1.5, borderColor: '#111110', borderRadius: 20 }}>
        <Code {...p} size={224} />
      </View>
      <View style={{ width: '100%', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#111110', fontFamily: fontFamilies.mono }}>
          1. SCAN   2. BROWSE   3. ORDER
        </Text>
        <View style={[base.hairline, { backgroundColor: '#1111101A', marginTop: 14 }]} />
        <Text style={{ fontSize: 11, color: '#11111073', fontFamily: fontFamilies.mono }}>
          any phone camera is enough
        </Text>
      </View>
    </View>
  );
}

const components = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11];

const names = [
  'Outline Pop',
  'Pop Yellow',
  'Clay Warm',
  'Noir Gold',
  'Forest Night',
  'Sunday Clean',
  'Sunday Midnight',
  'Sunday Heritage',
  'Poster Pop',
  'Bistro Serif',
  'Ticket Mono',
];

export const FLYER_W = W;
export const FLYER_H = H;

export const flyerTemplates = names.map((name, i) => ({
  id: i + 1,
  name,
  file: `QR-Flyer-${name.replace(/\s+/g, '-')}.png`,
  Component: components[i],
}));

export function getFlyerTemplate(templateId: unknown) {
  return flyerTemplates.find((f) => f.id === templateId) || flyerTemplates[5];
}
