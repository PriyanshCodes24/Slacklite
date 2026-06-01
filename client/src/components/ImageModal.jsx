import { RxCross2 } from "react-icons/rx";

export const ImageModal = ({ previewImage, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <img
      src={previewImage}
      alt="preview"
      className="max-h-[90vh] max-w-[90vw] rounded-lg"
    />

    <button
      onClick={onClose}
      className="cursor-pointer absolute top-4 right-4 text-3xl"
    >
      <RxCross2 />
    </button>
  </div>
);
