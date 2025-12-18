import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ToolLayout, LoadingSpinner, FileDropZone, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_AUDIO_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

const ffmpegInstance: { ffmpeg: FFmpeg | null; loadPromise: Promise<FFmpeg> | null } = {
  ffmpeg: null,
  loadPromise: null
};

function useFFmpeg() {
  const [loaded, setLoaded] = useState(!!ffmpegInstance.ffmpeg);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = async (): Promise<FFmpeg> => {
    if (ffmpegInstance.ffmpeg) {
      return ffmpegInstance.ffmpeg;
    }
    
    if (ffmpegInstance.loadPromise) {
      return ffmpegInstance.loadPromise;
    }
    
    setLoading(true);
    
    ffmpegInstance.loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      
      let lastProgress = -1;
      ffmpeg.on("progress", ({ progress: p }) => {
        const pct = Math.round(p * 100);
        if (pct !== lastProgress) {
          lastProgress = pct;
          setProgress(pct);
        }
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegInstance.ffmpeg = ffmpeg;
      setLoaded(true);
      setLoading(false);
      return ffmpeg;
    })();
    
    return ffmpegInstance.loadPromise;
  };

  return { ffmpeg: ffmpegInstance.ffmpeg, loaded, loading, load, progress, setProgress };
}

function FileSizeWarning({ maxSize, type }: { maxSize: number; type: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600 dark:text-amber-400">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>Maximum {type} file size: {formatSize(maxSize)}. Larger files may cause browser issues.</span>
    </div>
  );
}

export function AudioCompressor() {
  const tool = getToolById("audio-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState("128");
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ffmpeg, loaded, loading, load, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec(["-i", inputName, "-b:a", `${bitrate}k`, "-y", outputName]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      
      setResult({
        url: URL.createObjectURL(blob),
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Supports MP3, WAV, AAC, OGG</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <div className="space-y-4">
              <Label>Target Bitrate: {bitrate} kbps</Label>
              <Select value={bitrate} onValueChange={setBitrate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64">64 kbps (Low quality, smallest)</SelectItem>
                  <SelectItem value="96">96 kbps (Medium-low)</SelectItem>
                  <SelectItem value="128">128 kbps (Standard)</SelectItem>
                  <SelectItem value="192">192 kbps (High quality)</SelectItem>
                  <SelectItem value="256">256 kbps (Very high)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button onClick={compress} disabled={processing || loading}>
                {processing ? "Compressing..." : loading ? "Loading FFmpeg..." : "Compress Audio"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Compressed Audio">
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
                <audio controls src={result.url} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="compressed-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download Compressed Audio
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function AudioTrimmer() {
  const tool = getToolById("audio-trim")!;
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("0");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);

    const audio = new Audio(URL.createObjectURL(f));
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setEndTime(Math.floor(audio.duration).toString());
    };
  };

  const trim = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-ss", startTime,
        "-to", endTime,
        "-c", "copy",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trimming failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Duration: {formatTime(duration)}</p>
            </div>

            <audio ref={audioRef} controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Selected duration: {formatTime(Math.max(0, parseFloat(endTime) - parseFloat(startTime)))}
            </p>

            <div className="flex gap-4">
              <Button onClick={trim} disabled={processing || loading}>
                {processing ? "Trimming..." : "Trim Audio"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Trimmed Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="trimmed-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download Trimmed Audio
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function AudioSpeedChanger() {
  const tool = getToolById("audio-speed")!;
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState([1.0]);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const changeSpeed = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-filter:a", `atempo=${speed[0]}`,
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speed change failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <audio controls src={URL.createObjectURL(file)} className="w-full" />

            <div className="space-y-4">
              <Label>Speed: {speed[0].toFixed(2)}x</Label>
              <Slider
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x (Slower)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Faster)</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={changeSpeed} disabled={processing || loading}>
                {processing ? "Processing..." : "Change Speed"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Speed-Adjusted Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download={`audio-${speed[0]}x.mp3`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Audio
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function AudioConverter() {
  const tool = getToolById("audio-converter")!;
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_AUDIO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_AUDIO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const convert = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = `output.${outputFormat}`;

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec(["-i", inputName, "-y", outputName]);
      
      const data = await ff.readFile(outputName);
      const mimeTypes: Record<string, string> = {
        mp3: "audio/mp3",
        wav: "audio/wav",
        aac: "audio/aac",
        ogg: "audio/ogg"
      };
      const blob = new Blob([data], { type: mimeTypes[outputFormat] || "audio/mpeg" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_AUDIO_SIZE} type="audio" />
        
        {!file ? (
          <FileDropZone accept="audio/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop an audio file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="aac">AAC</SelectItem>
                  <SelectItem value="ogg">OGG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button onClick={convert} disabled={processing || loading}>
                {processing ? "Converting..." : `Convert to ${outputFormat.toUpperCase()}`}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title={`Converted to ${outputFormat.toUpperCase()}`}>
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download={`converted.${outputFormat}`}>
                    <Download className="w-4 h-4 mr-2" />
                    Download {outputFormat.toUpperCase()} File
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function VideoCompressor() {
  const tool = getToolById("video-compressor")!;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([28]);
  const [result, setResult] = useState<{ url: string; originalSize: number; compressedSize: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const compress = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-crf", quality[0].toString(),
        "-preset", "fast",
        "-c:a", "aac",
        "-b:a", "128k",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      
      setResult({
        url: URL.createObjectURL(blob),
        originalSize: file.size,
        compressedSize: blob.size
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-2">Supports MP4, WebM, MOV, AVI</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="space-y-4">
              <Label>Quality (CRF): {quality[0]} {quality[0] < 23 ? "(High quality, larger)" : quality[0] > 28 ? "(Lower quality, smaller)" : "(Balanced)"}</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={18}
                max={35}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Better Quality</span>
                <span>Smaller Size</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={compress} disabled={processing || loading}>
                {processing ? "Compressing..." : "Compress Video"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
                <p className="text-xs text-center text-muted-foreground">
                  Video compression may take several minutes
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Compressed Video">
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
                <video controls src={result.url} className="w-full max-h-64 rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result.url} download="compressed-video.mp4">
                    <Download className="w-4 h-4 mr-2" />
                    Download Compressed Video
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function VideoTrimmer() {
  const tool = getToolById("video-trim")!;
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("0");
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);

    const video = document.createElement("video");
    video.src = URL.createObjectURL(f);
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setEndTime(Math.floor(video.duration).toString());
    };
  };

  const trim = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp4";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-ss", startTime,
        "-to", endTime,
        "-c", "copy",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "video/mp4" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trimming failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here or click to browse</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Duration: {formatTime(duration)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max={duration}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Selected duration: {formatTime(Math.max(0, parseFloat(endTime) - parseFloat(startTime)))}
            </p>

            <div className="flex gap-4">
              <Button onClick={trim} disabled={processing || loading}>
                {processing ? "Trimming..." : "Trim Video"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Trimmed Video">
                <video controls src={result} className="w-full max-h-64 rounded-lg mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="trimmed-video.mp4">
                    <Download className="w-4 h-4 mr-2" />
                    Download Trimmed Video
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

export function VideoToAudio() {
  const tool = getToolById("video-to-audio")!;
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { load, loading, progress } = useFFmpeg();

  const handleFiles = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    if (f.size > MAX_VIDEO_SIZE) {
      setError(`File too large. Maximum size is ${formatSize(MAX_VIDEO_SIZE)}`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const extract = async () => {
    if (!file) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      const ff = await load();
      if (!ff) throw new Error("Failed to load FFmpeg");

      const inputName = "input" + file.name.substring(file.name.lastIndexOf("."));
      const outputName = "output.mp3";

      await ff.writeFile(inputName, await fetchFile(file));
      await ff.exec([
        "-i", inputName,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "192k",
        "-y", outputName
      ]);
      
      const data = await ff.readFile(outputName);
      const blob = new Blob([data], { type: "audio/mp3" });
      setResult(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-6">
        <FileSizeWarning maxSize={MAX_VIDEO_SIZE} type="video" />
        
        {!file ? (
          <FileDropZone accept="video/*" onFiles={handleFiles}>
            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Drop a video file here to extract audio</p>
          </FileDropZone>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">Size: {formatSize(file.size)}</p>
            </div>

            <video controls src={URL.createObjectURL(file)} className="w-full max-h-64 rounded-lg" />

            <div className="flex gap-4">
              <Button onClick={extract} disabled={processing || loading}>
                {processing ? "Extracting..." : "Extract Audio (MP3)"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Upload New File
              </Button>
            </div>

            {(processing || loading) && (
              <div className="space-y-2">
                <Progress value={loading ? 50 : progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {loading ? "Loading FFmpeg..." : `Processing: ${progress}%`}
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}

            {result && (
              <ResultDisplay title="Extracted Audio">
                <audio controls src={result} className="w-full mb-4" />
                <Button asChild className="w-full">
                  <a href={result} download="extracted-audio.mp3">
                    <Download className="w-4 h-4 mr-2" />
                    Download MP3 Audio
                  </a>
                </Button>
              </ResultDisplay>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
