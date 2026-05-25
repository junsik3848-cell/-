export type CompressOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0~1
};

const PRESET = {
  post: { maxWidth: 1200, maxHeight: 1200, quality: 0.8 },
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.85 },
} satisfies Record<string, CompressOptions>;

export async function compressImage(
  file: File,
  preset: keyof typeof PRESET | CompressOptions = "post"
): Promise<File> {
  const options = typeof preset === "string" ? PRESET[preset] : preset;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);

      let { width, height } = img;
      const ratio = Math.min(options.maxWidth / width, options.maxHeight / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("압축 실패")); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        options.quality
      );
    };

    img.onerror = reject;
    img.src = blobUrl;
  });
}

export async function compressImages(files: File[], preset: keyof typeof PRESET = "post"): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, preset)));
}
