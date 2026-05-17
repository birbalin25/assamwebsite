'use client';

import { useState, useCallback } from 'react';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import { Button } from '@/components/ui/Button';
import { RotateCcw } from 'lucide-react';

export interface CropData {
  x: number;      // crop area x percentage (0-100)
  y: number;      // crop area y percentage (0-100)
  width: number;  // crop area width percentage (0-100)
  height: number; // crop area height percentage (0-100)
  zoom: number;   // zoom level
}

interface ImageCropEditorProps {
  imageUrl: string;
  cropData?: CropData | null;
  onChange: (data: CropData) => void;
  aspect?: number;
}

const DEFAULT_CROP: Point = { x: 0, y: 0 };
const DEFAULT_ZOOM = 1;

export function ImageCropEditor({ imageUrl, cropData, onChange, aspect = 16 / 5 }: ImageCropEditorProps) {
  const [crop, setCrop] = useState<Point>(DEFAULT_CROP);
  const [zoom, setZoom] = useState(cropData?.zoom ?? DEFAULT_ZOOM);
  const [initialized, setInitialized] = useState(false);

  const onCropAreaChange = useCallback((croppedAreaPercentages: Area) => {
    onChange({
      x: croppedAreaPercentages.x,
      y: croppedAreaPercentages.y,
      width: croppedAreaPercentages.width,
      height: croppedAreaPercentages.height,
      zoom,
    });
  }, [onChange, zoom]);

  const handleReset = () => {
    setCrop(DEFAULT_CROP);
    setZoom(DEFAULT_ZOOM);
    onChange({ x: 0, y: 0, width: 100, height: 100, zoom: 1 });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-earth-700">Crop & Position</label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Reset Crop
        </Button>
      </div>

      <div className="relative w-full rounded-lg overflow-hidden bg-earth-100" style={{ height: 300 }}>
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropAreaChange={onCropAreaChange}
          objectFit="contain"
          showGrid={true}
          initialCroppedAreaPercentages={
            cropData && initialized === false
              ? { x: cropData.x, y: cropData.y, width: cropData.width, height: cropData.height }
              : undefined
          }
          onMediaLoaded={() => setInitialized(true)}
          style={{
            containerStyle: { borderRadius: '0.5rem' },
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-earth-600 whitespace-nowrap">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-1.5 bg-earth-200 rounded-full appearance-none cursor-pointer accent-gamosa-500"
        />
        <span className="text-sm text-earth-500 tabular-nums w-10 text-right">{zoom.toFixed(1)}x</span>
      </div>

      <p className="text-xs text-earth-400">
        Drag the image to reposition. Use the slider or scroll to zoom. The highlighted area shows what will be visible on the page.
      </p>
    </div>
  );
}
