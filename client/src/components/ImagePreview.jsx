import { useEffect } from "react";

const ImagePreview = ({ image, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Prevent background scrolling
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span className="text-xl leading-none">✕</span>
      </button>

      {/* Image container */}
      <div
        className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center animate-[fadeIn_200ms_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Preview"
          className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
        />
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/60 backdrop-blur-md">
        Press <span className="font-medium text-white/80">Esc</span> to close
      </div>
    </div>
  );
};

export default ImagePreview;