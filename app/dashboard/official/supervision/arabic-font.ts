// This is a simplified version - in a real app, you would include the full font data
export const addFontArabic = (doc: any) => {
  // In a real implementation, you would add the actual font data here
  // For this demo, we'll assume the font is already available
  doc.addFileToVFS("Cairo-normal.ttf", "base64-encoded-font-data")
  doc.addFileToVFS("Cairo-bold.ttf", "base64-encoded-font-data")
  doc.addFont("Cairo-normal.ttf", "Cairo", "normal")
  doc.addFont("Cairo-bold.ttf", "Cairo", "bold")
}

