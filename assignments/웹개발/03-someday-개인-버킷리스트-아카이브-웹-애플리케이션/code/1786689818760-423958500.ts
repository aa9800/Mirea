// 사진 첨부(추가 기능)에서 사용하는 이미지 처리 유틸.
// FileReader로 파일을 읽고, canvas로 리사이즈해 localStorage 용량 문제를 줄인다.

const MAX_DIMENSION = 800; // 가로/세로 중 긴 쪽을 이 값 이하로 축소한다.
const JPEG_QUALITY = 0.75;

/**
 * 이미지 파일을 읽어 긴 변 기준 MAX_DIMENSION 이하로 축소한 뒤,
 * base64 JPEG 데이터 URL로 변환한다. 원본이 이미 작으면 그대로 축소 없이 반환한다.
 */
export function readAndResizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."));
    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error("이미지를 불러오지 못했습니다."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const targetWidth = Math.round(img.width * scale);
        const targetHeight = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
