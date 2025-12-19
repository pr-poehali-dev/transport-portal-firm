import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface UploadedFile {
  name: string;
  data: string;
  size: number;
  type: string;
}

interface OrderFileUploadProps {
  uploadedFiles: UploadedFile[];
  uploading: boolean;
  editOrder?: any;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

export default function OrderFileUpload({
  uploadedFiles,
  uploading,
  editOrder,
  onFileUpload,
  onRemoveFile
}: OrderFileUploadProps) {
  return (
    <div>
      <Label className="text-sm">Прикрепить файлы (накладные, заявки)</Label>
      <div className="mt-2">
        <Input
          type="file"
          multiple
          onChange={onFileUpload}
          disabled={uploading || !!editOrder}
          className="cursor-pointer"
        />
        {uploading && <p className="text-sm text-blue-500 mt-2">Загрузка...</p>}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Загруженные файлы:</p>
          <div className="grid grid-cols-2 gap-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border">
                <Icon name="File" size={16} className="text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                {!editOrder && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(idx)}
                    className="h-6 w-6 p-0"
                  >
                    <Icon name="X" size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
