import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface UploadedFile {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  type: string;
}

const TempFilesPage = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Читаем файл как base64
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64 = event.target?.result as string;
          const base64Data = base64.split(',')[1]; // Убираем префикс data:...;base64,

          try {
            // Отправляем на backend для загрузки в S3
            const response = await fetch('https://functions.poehali.dev/a1565489-266d-48f5-9392-48c4c1c924ed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'upload_temp_file',
                filename: file.name,
                content: base64Data,
                content_type: file.type || 'application/octet-stream'
              })
            });

            const data = await response.json();

            if (data.success) {
              const newFile: UploadedFile = {
                name: file.name,
                url: data.url,
                size: file.size,
                uploadedAt: new Date().toISOString(),
                type: file.type || 'unknown'
              };

              setFiles(prev => [newFile, ...prev]);
              toast.success(`Файл "${file.name}" загружен`);
            } else {
              toast.error(`Ошибка загрузки "${file.name}"`);
            }
          } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Не удалось загрузить "${file.name}"`);
          }
        };

        reader.readAsDataURL(file);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Ссылка скопирована');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return 'Image';
    if (type.includes('pdf')) return 'FileText';
    if (type.includes('word') || type.includes('document')) return 'FileText';
    if (type.includes('sheet') || type.includes('excel')) return 'Table';
    return 'File';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Upload" size={24} />
            Временные файлы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Icon name="Upload" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Загрузите файлы (PDF, изображения, документы)
              </p>
              <Button
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Выбрать файлы'}
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Загруженные файлы ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Icon name={getFileIcon(file.type)} size={24} className="text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(file.url)}
                      >
                        <Icon name="Copy" size={16} className="mr-1" />
                        Копировать ссылку
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Icon name="ExternalLink" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Icon name="Info" size={24} className="text-blue-600 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-2">Как использовать:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Загрузите файлы через эту страницу</li>
                <li>Скопируйте ссылку на файл</li>
                <li>Вставьте ссылку в чат с Юрой</li>
                <li>Юра прочитает и обработает файл</li>
              </ol>
              <p className="mt-3 text-xs text-gray-600">
                Файлы хранятся в облаке и доступны по ссылке
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempFilesPage;