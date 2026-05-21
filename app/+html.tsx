/**
 * Custom HTML wrapper untuk web export.
 *
 * Inject @font-face declarations untuk semua icon font langsung di <head>
 * supaya icons di-load via mekanisme CSS browser native (bukan via JS
 * useFonts hook yang punya timing/race issue).
 *
 * Hash filename relatif stabil — sama selama isi font file tidak berubah.
 * Kalau hash berubah (versi @expo/vector-icons di-upgrade), regenerate
 * file ini atau update path manual.
 */
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const FONTS = [
  ['Ionicons', '6148e7019854f3bde85b633cb88f3c25'],
  ['MaterialIcons', '4e85bc9ebe07e0340c9c4fc2f6c38908'],
  ['MaterialCommunityIcons', 'b62641afc9ab487008e996a5c5865e56'],
  ['AntDesign', '3a2ba31570920eeb9b1d217cabe58315'],
  ['Entypo', '31b5ffea3daddc69dd01a1f3d6cf63c5'],
  ['EvilIcons', '140c53a7643ea949007aa9a282153849'],
  ['Feather', 'a76d309774d33d9856f650bed4292a23'],
  ['FontAwesome', 'b06871f281fee6b241d60582ae9369b9'],
  ['FontAwesome5_Brands', '3b89dd103490708d19a95adcae52210e'],
  ['FontAwesome5_Regular', '1f77739ca9ff2188b539c36f30ffa2be'],
  ['FontAwesome5_Solid', '605ed7926cf39a2ad5ec2d1f9d391d3d'],
  ['Fontisto', 'b49ae8ab2dbccb02c4d11caaacf09eab'],
  ['Foundation', 'e20945d7c929279ef7a6f1db184a4470'],
  ['Octicons', 'f7c53c47a66934504fcbc7cc164895a7'],
  ['SimpleLineIcons', 'd2285965fe34b05465047401b8595dd0'],
  ['Zocial', '1681f34aaca71b8dfb70756bca331eb2'],
];

const fontFaceCSS = FONTS.map(
  ([name, hash]) => `
@font-face {
  font-family: '${name}';
  src: url('/fonts/${name}.${hash}.ttf') format('truetype');
  font-display: block;
  font-weight: normal;
  font-style: normal;
}`,
).join('\n');

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="/fonts/Ionicons.6148e7019854f3bde85b633cb88f3c25.ttf"
          crossOrigin="anonymous"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: fontFaceCSS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
