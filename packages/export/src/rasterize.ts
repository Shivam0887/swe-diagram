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
 *
 * Transparency: when `options.transparentBackground` is true the SVG
 * is rendered without a background rect. Sharp rasterizes the SVG
 * with the natural alpha channel of the root — no extra `flatten` or
 * background composite is applied — so the output PNG has an alpha
 * channel. Callers that want a fully-opaque PNG can leave the flag
 * off (default) and the renderer's grid background will fill the
 * canvas as before.
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
  try {
    // sharp 0.35 changed how the default export is exposed: the module
    // itself is callable in 0.33, but in 0.35 the function lives on
    // `mod.default` and is also the namespace's `sharp` member. Pick
    // whichever one is callable; this keeps both versions working.
    const mod = await import('sharp');
    const sharpFn =
      (typeof mod === 'function' ? mod : null) ??
      (mod as { default?: unknown }).default ??
      (mod as unknown as { sharp?: unknown }).sharp;
    if (typeof sharpFn !== 'function') {
      throw new Error('sharp module loaded but no callable default export was found');
    }
    return await (sharpFn as (input: Buffer, opts?: { density?: number }) => {
      png: (opts?: { quality?: number; compressionLevel?: number }) => {
        toBuffer: () => Promise<Buffer>;
      };
    })(svgBuffer, { density: Math.round(72 * scale) })
      .png({ quality: 95, compressionLevel: 9 })
      .toBuffer();
  } catch (err) {
    throw new Error(
      `PNG export unavailable: native sharp binary failed to load (${(err as Error).message ?? err}). ` +
        `Use SVG export instead, or install sharp's prebuilt for your platform.`
    );
  }
}
