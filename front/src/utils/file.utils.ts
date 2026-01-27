/**
 * File utility functions
 */

/**
 * Convert a File object to base64 string
 * @param file - File to convert
 * @returns Promise with base64 string (without data URL prefix)
 */
export async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns True if valid image file
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize;
}

/**
 * Get file extension
 * @param fileName - Name of the file
 * @returns File extension or empty string
 */
export function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}
