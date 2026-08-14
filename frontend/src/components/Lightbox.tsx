import { useEffect } from 'react';

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
}

// 썸네일이 너무 작아서 안 보일 때 클릭하면 원본 크기로 크게 보여주는 오버레이.
// 배경 클릭, 닫기 버튼, Esc 키 아무거나로 닫힌다.
export default function Lightbox({ src, alt, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="닫기">
        ×
      </button>
      {/* 이미지 자체를 눌러도 배경 클릭으로 오인해 닫히지 않도록 전파를 막는다 */}
      <img src={src} alt={alt} className="lightbox__img" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}
