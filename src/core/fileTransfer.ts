import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const triggerBrowserDownload = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const saveTextFile = async (filename: string, content: string, mimeType: string) => {
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Filesystem')) {
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true
    });

    if (Capacitor.isPluginAvailable('Share')) {
      await Share.share({
        title: filename,
        text: `Arquivo exportado: ${filename}`,
        url: result.uri
      });
    }

    return;
  }

  triggerBrowserDownload(filename, content, mimeType);
};

export const readImportedTextFile = async (file: File) => file.text();
