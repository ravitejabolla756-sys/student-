import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToolLayout, LoadingSpinner, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload } from "lucide-react";

function simulateProcessing(callback: () => void) {
  setTimeout(callback, 1000 + Math.random() * 500);
}

function downloadImage(canvas: HTMLCanvasElement, filename: string, format: string = "image/png") {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL(format);
  link.click();
}

export function ImageResizer() {
  const tool = getToolById("image-resizer")!;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setWidth(String(img.width));
      setHeight(String(img.height));
    };
    img.src = url;
  };

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (maintainRatio && image) {
      const ratio = image.height / image.width;
      setHeight(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (maintainRatio && image) {
      const ratio = image.width / image.height;
      setWidth(String(Math.round(parseInt(val) * ratio)));
    }
  };

  const resize = () => {
    if (!image || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const w = parseInt(width) || image.width;
      const h = parseInt(height) || image.height;
      
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(image, 0, 0, w, h);
      
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "resized-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Width (px)</Label>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    data-testid="input-height"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={maintainRatio}
                    onChange={(e) => setMaintainRatio(e.target.checked)}
                    id="ratio"
                    className="rounded"
                  />
                  <Label htmlFor="ratio">Maintain aspect ratio</Label>
                </div>
                
                <Button onClick={resize} disabled={loading} className="w-full" data-testid="button-resize">
                  {loading ? "Resizing..." : "Resize Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setImage(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Resizing image..." />}

            {result && !loading && (
              <ResultDisplay title="Resized Image">
                <img src={result} alt="Resized" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Resized Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageCropper() {
  const tool = getToolById("image-cropper")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setOriginalDimensions({ width: img.width, height: img.height });
      setCropData({ x: 0, y: 0, width: img.width, height: img.height });
    };
    img.src = url;
  };

  const crop = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      canvas.width = cropData.width;
      canvas.height = cropData.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        imageRef.current!,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
      );
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "cropped-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({originalDimensions.width} x {originalDimensions.height})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position</Label>
                    <Input
                      type="number"
                      value={cropData.x}
                      onChange={(e) => setCropData({...cropData, x: parseInt(e.target.value) || 0})}
                      max={originalDimensions.width}
                      data-testid="input-x"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position</Label>
                    <Input
                      type="number"
                      value={cropData.y}
                      onChange={(e) => setCropData({...cropData, y: parseInt(e.target.value) || 0})}
                      max={originalDimensions.height}
                      data-testid="input-y"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input
                      type="number"
                      value={cropData.width}
                      onChange={(e) => setCropData({...cropData, width: parseInt(e.target.value) || 0})}
                      max={originalDimensions.width - cropData.x}
                      data-testid="input-width"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height</Label>
                    <Input
                      type="number"
                      value={cropData.height}
                      onChange={(e) => setCropData({...cropData, height: parseInt(e.target.value) || 0})}
                      max={originalDimensions.height - cropData.y}
                      data-testid="input-height"
                    />
                  </div>
                </div>
                
                <Button onClick={crop} disabled={loading} className="w-full" data-testid="button-crop">
                  {loading ? "Cropping..." : "Crop Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Cropping image..." />}

            {result && !loading && (
              <ResultDisplay title="Cropped Image">
                <img src={result} alt="Cropped" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Cropped Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageCompressor() {
  const tool = getToolById("image-compressor")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [result, setResult] = useState<{url: string; originalSize: number; compressedSize: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const compress = () => {
    if (!imageRef.current || !canvasRef.current || !originalFile) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      const compressedUrl = canvas.toDataURL("image/jpeg", quality[0] / 100);
      const compressedSize = Math.round((compressedUrl.length - 22) * 3 / 4);
      
      setResult({
        url: compressedUrl,
        originalSize: originalFile.size,
        compressedSize
      });
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const link = document.createElement("a");
      link.download = "compressed-image.jpg";
      link.href = result.url;
      link.click();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image ({formatSize(originalFile?.size || 0)})</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    min={10}
                    max={100}
                    step={5}
                    data-testid="slider-quality"
                  />
                  <p className="text-xs text-muted-foreground">Lower quality = smaller file size</p>
                </div>
                
                <Button onClick={compress} disabled={loading} className="w-full" data-testid="button-compress">
                  {loading ? "Compressing..." : "Compress Image"}
                </Button>
                
                <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }} className="w-full">
                  Upload New Image
                </Button>
              </div>
            </div>

            {loading && <LoadingSpinner text="Compressing image..." />}

            {result && !loading && (
              <ResultDisplay title="Compressed Image">
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-bold">{formatSize(result.originalSize)}</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Compressed</p>
                    <p className="font-bold text-primary">{formatSize(result.compressedSize)}</p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Reduced by {Math.round((1 - result.compressedSize / result.originalSize) * 100)}%
                </p>
                <img src={result.url} alt="Compressed" className="max-w-full h-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download Compressed Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function JpgToPng() {
  const tool = getToolById("jpg-to-png")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "converted-image.png", "image/png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/jpeg,image/jpg" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a JPG image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img src={imageUrl} alt="Original" className="max-w-full max-h-96 mx-auto rounded-lg border border-border" />
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to PNG"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to PNG..." />}

            {result && !loading && (
              <ResultDisplay title="Converted PNG Image">
                <img src={result} alt="Converted" className="max-w-full max-h-96 mx-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function PngToJpg() {
  const tool = getToolById("png-to-jpg")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      setResult(canvas.toDataURL("image/jpeg", 0.9));
      setLoading(false);
    });
  };

  const download = () => {
    if (result) {
      const link = document.createElement("a");
      link.download = "converted-image.jpg";
      link.href = result;
      link.click();
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/png" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a PNG image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img src={imageUrl} alt="Original" className="max-w-full max-h-96 mx-auto rounded-lg border border-border" />
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to JPG"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to JPG..." />}

            {result && !loading && (
              <ResultDisplay title="Converted JPG Image">
                <img src={result} alt="Converted" className="max-w-full max-h-96 mx-auto rounded-lg border border-border mb-4" />
                <Button onClick={download} className="w-full" data-testid="button-download">
                  <Download className="w-4 h-4 mr-2" />
                  Download JPG Image
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImageGrayscale() {
  const tool = getToolById("image-grayscale")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
    };
    img.src = url;
  };

  const convert = () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setLoading(true);
    simulateProcessing(() => {
      const canvas = canvasRef.current!;
      const img = imageRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      
      ctx.putImageData(imageData, 0, 0);
      setResult(canvas.toDataURL("image/png"));
      setLoading(false);
    });
  };

  const download = () => {
    if (canvasRef.current) {
      downloadImage(canvasRef.current, "grayscale-image.png");
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Original Image</Label>
                <img src={imageUrl} alt="Original" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              {result && (
                <div>
                  <Label className="text-sm mb-2 block">Grayscale Image</Label>
                  <img src={result} alt="Grayscale" className="max-w-full h-auto rounded-lg border border-border" />
                </div>
              )}
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={convert} disabled={loading} data-testid="button-convert">
                {loading ? "Converting..." : "Convert to Grayscale"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setResult(null); }}>
                Upload New Image
              </Button>
            </div>

            {loading && <LoadingSpinner text="Converting to grayscale..." />}

            {result && !loading && (
              <Button onClick={download} className="w-full" data-testid="button-download">
                <Download className="w-4 h-4 mr-2" />
                Download Grayscale Image
              </Button>
            )}
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </ToolLayout>
  );
}

export function ImagePreview() {
  const tool = getToolById("image-preview")!;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    name: string;
    type: string;
    size: number;
    width: number;
    height: number;
  } | null>(null);

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    
    const img = new Image();
    img.onload = () => {
      setImageInfo({
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.width,
        height: img.height
      });
    };
    img.src = url;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        {!imageUrl ? (
          <FileDropZone accept="image/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an image here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm mb-2 block">Image Preview</Label>
                <img src={imageUrl} alt="Preview" className="max-w-full h-auto rounded-lg border border-border" />
              </div>
              
              {imageInfo && (
                <div>
                  <Label className="text-sm mb-2 block">Image Information</Label>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name</span>
                      <span className="font-medium text-right break-all max-w-[200px]">{imageInfo.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Type</span>
                      <span className="font-medium">{imageInfo.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">{formatSize(imageInfo.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="font-medium">{imageInfo.width} x {imageInfo.height} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aspect Ratio</span>
                      <span className="font-medium">
                        {(imageInfo.width / imageInfo.height).toFixed(2)}:1
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pixels</span>
                      <span className="font-medium">
                        {(imageInfo.width * imageInfo.height).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="outline" onClick={() => { setImageUrl(null); setImageInfo(null); }} className="w-full">
              Upload New Image
            </Button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
