import React from "react";
import { ChevronDown } from "lucide-react";

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "compose-album"
  | "create-video";

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  mode: StudioMode;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  setSelectedModel,
  mode,
}) => {
  const getModelsForMode = (currentMode: StudioMode) => {
    if (currentMode === "create-video") {
      return [
        "veo-3.0-generate-001",
        "veo-3.0-fast-generate-001",
        "veo-2.0-generate-001",
      ];
    } else {
      // For image modes
      return ["gemini-2.5-flash-image-preview", "imagen-4.0-fast-generate-001"];
    }
  };

  const models = getModelsForMode(mode);

  const formatModelName = (model: string) => {
    if (model.includes("veo-3.0-fast")) return "Veo 3 - Fast";
    if (model.includes("veo-3.0")) return "Veo 3";
    if (model.includes("veo-2.0")) return "Veo 2";
    if (model.includes("gemini-2.5")) return "Gemini 2.5 Flash";
    if (model.includes("imagen-4.0")) return "Imagen 4.0 Fast";
    return model;
  };

  return (
    <div className="relative flex items-center">
      <select
        aria-label="Model selector"
        value={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
        className="pl-3 pr-8 py-2 text-sm rounded-md border  focus:outline-none focus:ring-2 focus:ring-gray-500 appearance-none"
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {formatModelName(model)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default ModelSelector;
