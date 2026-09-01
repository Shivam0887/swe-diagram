import type { DiagramDocument } from '@platform/diagram-schema';
import { renderDiagram, type RenderOptions } from '@platform/diagram-renderer';

export type PngExportOptions = RenderOptions & {
  scale?: number;
};

/**
 * Rasterize a DiagramDocument to a PNG buffer using sharp.
 *
 * IMPORTANT: if the native sharp binary is unavailable, this throws rather
 * than silently returning SVG bytes. Returning SVG with PNG Content-Type
 * would render broken images for the user.
 */
export async function exportToPngBuffer(
  doc: DiagramDocument,
  options: PngExportOptions = {}
): Promise<Buffer> {
  const scale = options.scale ?? 2;
  const result = renderDiagram(doc, options);
  return await exportSvgStringToPngBuffer(result.svg, scale);
}

export async function exportSvgStringToPngBuffer(
  svgString: string,
  scale = 2
): Promise<Buffer> {
  const svgBuffer = Buffer.from(svgString, 'utf-8');
  let sharp: typeof import('sharp');
  try {
    const mod = await import('sharp');
    sharp = (mod.default ?? mod) as typeof import('sharp');
  } catch (err) {
    throw new Error(
      `PNG export unavailable: native sharp binary failed to load (${(err as Error).message ?? err}). ` +
        `Use SVG export instead, or install sharp's prebuilt for your platform.`
    );
  }
  return await sharp(svgBuffer, { density: Math.round(72 * scale) })
    .png({ quality: 95, compressionLevel: 9 })
    .toBuffer();
}
