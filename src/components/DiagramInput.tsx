import { useState, useCallback } from "react";
import { Upload, FileCode, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MermaidPreview } from "./MermaidPreview";

interface DiagramInputProps {
  inputType: "image" | "mermaid";
  onInputTypeChange: (type: "image" | "mermaid") => void;
  imageFile: File | null;
  onImageChange: (file: File | null) => void;
  mermaidText: string;
  onMermaidChange: (text: string) => void;
}

export function DiagramInput({
  inputType,
  onInputTypeChange,
  imageFile,
  onImageChange,
  mermaidText,
  onMermaidChange,
}: DiagramInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageChange(file);
        setImagePreview(URL.createObjectURL(file));
      }
    },
    [onImageChange]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageChange(file);
        setImagePreview(URL.createObjectURL(file));
      }
    },
    [onImageChange]
  );

  const clearImage = () => {
    onImageChange(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const exampleMermaid = `flowchart TB
  U[User] -->|HTTPS| APIGW[API Gateway]
  APIGW -->|HTTPS| API[Backend API]
  API --> DB[(Database)]
  API --> AUTH[Identity Provider]`;

  return (
    <Card className="border-border/50 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileCode className="h-5 w-5 text-accent" />
          Diagram Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={inputType} onValueChange={(v) => onInputTypeChange(v as "image" | "mermaid")}>
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Image Upload
            </TabsTrigger>
            <TabsTrigger value="mermaid" className="gap-2">
              <FileCode className="h-4 w-4" />
              Mermaid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="image" className="mt-0">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Uploaded diagram"
                  className="max-h-64 w-full rounded-lg border border-border object-contain"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8"
                  onClick={clearImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
                  isDragging
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/50 hover:bg-muted/30"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="mb-1 text-sm font-medium">
                  Drag & drop your architecture diagram
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, SVG up to 10MB
                </p>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="mermaid" className="mt-0 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mermaid Code</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onMermaidChange(exampleMermaid)}
                  >
                    Load Example
                  </Button>
                </div>
                <Textarea
                  placeholder="Enter your Mermaid diagram code..."
                  className="min-h-[200px] resize-none font-mono text-sm"
                  value={mermaidText}
                  onChange={(e) => onMermaidChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preview</label>
                <MermaidPreview code={mermaidText} className="min-h-[200px]" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
