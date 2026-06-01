export const ImageUploadPreview = ({selectedFile,onRemove}) => {
  return (
    <div className="mb-2 bg-gray-800 p-2 rounded">
      <img
        src={URL.createObjectURL(selectedFile)}
        alt="preview"
        className="max-h-40 rounded"
      />

      <button
        onClick={onRemove}
        className="text-red-400 text-xs mt-2 cursor-pointer"
      >
        Remove
      </button>
    </div>
  );
};
