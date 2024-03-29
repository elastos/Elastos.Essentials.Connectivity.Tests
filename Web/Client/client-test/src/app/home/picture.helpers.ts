
interface Mime {
  mime: string;
  pattern: (number | undefined)[];
}

const imageMimes: Mime[] = [
  {
    mime: 'image/png',
    pattern: [0x89, 0x50, 0x4e, 0x47]
  },
  {
    mime: 'image/jpeg',
    pattern: [0xff, 0xd8, 0xff]
  },
  {
    mime: 'image/gif',
    pattern: [0x47, 0x49, 0x46, 0x38]
  },
  {
    mime: 'image/webp',
    pattern: [0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50],
  }
];

/**
 * Encodes a raw binary picture data into a base64 string.
 * Ex: âPNG   IHDR... ---> "iVe89...."
 */
export function rawImageToBase64(rawImageData: Buffer): string {
  if (!rawImageData)
    return null;

  return Buffer.from(rawImageData).toString("base64");
}

/**
 * Converts a base64 encoded raw binary picture data into its original raw binary buffer.
 * Ex: "iVe89...." ---> âPNG   IHDR...
 */
export function base64ImageToBuffer(base64Picture: string): Buffer {
  return Buffer.from(base64Picture, "base64");
}

/**
 * Converts a raw binary picture data to a base64 data url usable on UI.
 * Ex: âPNG   IHDR... ---> "data:image/png;base64,iVe89...."
 */
export async function rawImageToBase64DataUrl(rawImageData: Buffer): Promise<string> {
  if (!rawImageData)
    return null;

  let mimeType = await pictureMimeType(rawImageData);
  if (!mimeType) {
    console.warn("picturehelper", "Unable to extract mime type from picture buffer. rawImageToBase64DataUrl() returns null picture.");
    return null;
  }

  return "data:" + mimeType + ";base64," + rawImageToBase64(rawImageData);
}

/**
 * Returns a 1x1 px fully transparent picture, encoded as base64 data url.
 * Use https://png-pixel.com/ to generate.
 */
export function transparentPixelIconDataUrl(): string {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}

function isMime(bytes: Uint8Array, mime: Mime): boolean {
  return mime.pattern.every((p, i) => !p || bytes[i] === p);
}

/**
 * @param rawOrBase64ImageData Raw picture buffer, or base64 encoded raw picture (not a base64 data url)
 */
export function pictureMimeType(rawOrBase64ImageData: Buffer | string): Promise<string> {
  if (typeof rawOrBase64ImageData === "string")
    rawOrBase64ImageData = base64ImageToBuffer(rawOrBase64ImageData);

  const numBytesNeeded = Math.max(...imageMimes.map(m => m.pattern.length));
  const blob = new Blob([rawOrBase64ImageData.slice(0, numBytesNeeded)]); // Read the needed bytes of the file

  const fileReader = new FileReader();
  let p = new Promise<string>((resolve) => {
    fileReader.onloadend = e => {
      //console.log("DEBUG ONLOADEND", e);
      if (!e || !fileReader.result) {
        resolve(null);
        return;
      }

      const bytes = new Uint8Array(fileReader.result as ArrayBuffer);

      const mime = imageMimes.find(mime => isMime(bytes, mime));

      if (!mime)
        resolve(null);
      else
        resolve(mime.mime);
    };
  });

  fileReader.readAsArrayBuffer(blob);

  return p;
}