"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { Upload, Film, Image as ImageIcon, Maximize2, RotateCcw, Trash2, Folder, Search } from "lucide-react";
import VideoPlayer from "@/components/ui/VideoPlayer";
import PhotoEditorControls from "@/components/ui/PhotoEditorControls";
import ImageComposerControls from "@/components/ui/ImageComposerControls";
import AlbumComposerControls from "@/components/ui/AlbumComposerControls";
import { ImagePreviewProvider, useImagePreview } from "@/context/ImagePreviewContext";
import Composer from "@/components/ui/Composer"; // Keeping this if it's needed for the sidebar wrapper, though the JSX seems to use specific controls.
import LoginButton from "@/components/auth/LoginButton";

type VeoOperationName = string | null;

type StudioMode =
  | "create-image"
  | "edit-image"
  | "compose-image"
  | "compose-album"
  | "create-video";

const POLL_INTERVAL_MS = 5000;

interface AlbumItem {
  id: string;
  label: string;
  image: string;
  prompt: string;
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  timestamp: number;
  folderId: string | null;
  prompt?: string;
  mode?: StudioMode;
}

interface Folder {
  id: string;
  name: string;
  color: string;
}

const VeoStudioContent: React.FC = () => {
  const { openPreview } = useImagePreview();
  const [mode, setMode] = useState<StudioMode>("create-image");
  const [prompt, setPrompt] = useState(""); // Video or image prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("veo-3.0-generate-001");

  // Image generation prompts
  const [imagePrompt, setImagePrompt] = useState("");
  const [editPrompt, setEditPrompt] = useState("");
  const [composePrompt, setComposePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [multipleImageFiles, setMultipleImageFiles] = useState<File[]>([]);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [geminiBusy, setGeminiBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  // Album mode state
  const [albumItems, setAlbumItems] = useState<AlbumItem[]>([]);
  const [albumThemeImage, setAlbumThemeImage] = useState<string>("");
  const [albumSourceImage, setAlbumSourceImage] = useState<File | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  const [isGeneratingAlbum, setIsGeneratingAlbum] = useState(false);

  // History and Folders state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'default', name: 'All Images', color: 'blue' }
  ]);
  const [selectedFolder, setSelectedFolder] = useState<string>('default');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [openFolderDropdown, setOpenFolderDropdown] = useState<string | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);

  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  // Update selected model when mode changes
  useEffect(() => {
    if (mode === "create-video") {
      setSelectedModel("veo-3.0-generate-001");
    } else if (mode === "edit-image" || mode === "compose-image" || mode === "compose-album") {
      setSelectedModel("gemini-2.5-flash-image-preview");
    } else if (mode === "create-image") {
      if (
        !selectedModel.includes("gemini") &&
        !selectedModel.includes("imagen")
      ) {
        setSelectedModel("gemini-2.5-flash-image-preview");
      }
    }
  }, [mode, selectedModel]);

  // Debug multipleImageFiles state
  useEffect(() => {
    console.log(
      "multipleImageFiles state changed:",
      multipleImageFiles.length,
      multipleImageFiles
    );
  }, [multipleImageFiles]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (imageFile) {
      objectUrl = URL.createObjectURL(imageFile);
      setUploadedImageUrl(objectUrl);
    } else {
      setUploadedImageUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageFile]);

  // Fetch history and folders on mount/login
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        console.log('Fetching history for user:', user?.id);

        if (user) {
          // Fetch folders
          const foldersResp = await fetch('/api/user/folders');
          if (foldersResp.ok) {
            const foldersData = await foldersResp.json();
            console.log('Folders received:', foldersData);
            if (foldersData.folders) {
              setFolders([
                { id: 'default', name: 'All Images', color: 'blue' },
                ...foldersData.folders
              ]);
            }
          }

          // Fetch history
          const resp = await fetch('/api/user/history?limit=50');
          console.log('History API response status:', resp.status);

          if (resp.ok) {
            const data = await resp.json();
            console.log('History data received:', data);

            if (data.history && data.history.length > 0) {
              setHistory(prev => {
                const existingIds = new Set(prev.map(h => h.id));
                const newItems = data.history.filter((h: HistoryItem) => !existingIds.has(h.id));
                const merged = [...newItems, ...prev].sort((a, b) => b.timestamp - a.timestamp);
                console.log('Setting history with', merged.length, 'items');
                return merged;
              });
            } else {
              console.log('No history items found');
            }
          } else {
            console.error('History API failed:', resp.status, resp.statusText);
          }
        } else {
          console.log('No user logged in, skipping history fetch');
        }
      } catch (e) {
        console.error("Failed to fetch history:", e);
      }
    };

    fetchHistory();

    // Listen for auth changes to re-fetch history
    const setupAuthListener = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchHistory();
        } else if (event === 'SIGNED_OUT') {
          setHistory([]);
          setFolders([{ id: 'default', name: 'All Images', color: 'blue' }]);
        }
      });
      return subscription;
    };

    const subPromise = setupAuthListener();
    return () => {
      subPromise.then(sub => sub.unsubscribe());
    };
  }, []);

  // Create folder function
  const createFolder = async (name: string, color: string = 'blue') => {
    try {
      const resp = await fetch('/api/user/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });

      if (resp.ok) {
        const data = await resp.json();
        setFolders(prev => [...prev, data.folder]);
        return data.folder;
      }
    } catch (e) {
      console.error('Failed to create folder:', e);
    }
  };

  // Assign image to folder function
  const assignImageToFolder = async (imageId: string, folderId: string | null) => {
    try {
      const resp = await fetch('/api/images/folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, folderId })
      });

      if (resp.ok) {
        // Update local state
        setHistory(prev => prev.map(h =>
          h.id === imageId ? { ...h, folderId } : h
        ));
      }
    } catch (e) {
      console.error('Failed to assign folder:', e);
    }
  };

  const modelLabel = useMemo(() => {
    const cleaned = selectedModel
      .replace(/preview/gi, "")
      .trim();
    return cleaned || selectedModel;
  }, [selectedModel]);

  // Rotating loading messages containing model name
  const loadingMessages = useMemo(() => {
    if (mode === "create-video") {
      return [
        `${modelLabel} is crafting your idea...`,
        "Generating keyframes and motion...",
        "Enhancing detail and lighting...",
        "Color grading and encoding...",
        "Almost there...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "Did you know? That Trees are the second most photographed object in the world after the Sun.",
        "That's why we need to make sure your video is perfect.",
        "We're working on it...",
        "Hang on a sec...",
        "Almost done...",
        "One more step...",
        "Kidding, this takes a while...",
        "Haha sorry",
        "So How are you doing?",
        "Crazy what progress can be made in a few seconds?",
        "Let me check on it...",
        "Okay almost done...",
      ];
    }
    return [
      `${modelLabel} is crafting your image...`,
      "Composing layout and subject...",
      "Applying style and color...",
      "Refining edges and textures...",
      "Almost there...",
      "One more step...",
      "Kidding, this takes a while...",
      "Haha sorry",
      "So How are you doing?",
      "Crazy what progress can be made in a few seconds?",
      "Let me check on it...",
      "Okay almost done...",
      "I promise I'm working on it...",
    ];
  }, [mode, modelLabel]);

  const [loadingIndex, setLoadingIndex] = useState(0);

  // Single flag for whether we are actively generating
  const isLoadingUI = useMemo(
    () => isGenerating || imagenBusy || geminiBusy || isGeneratingAlbum,
    [isGenerating, imagenBusy, geminiBusy, isGeneratingAlbum]
  );

  // Advance loading message while any generation is happening
  useEffect(() => {
    if (!isLoadingUI) {
      setLoadingIndex(0);
      return;
    }
    const id = setInterval(() => {
      setLoadingIndex((i) => (i + 1) % loadingMessages.length);
    }, 2200);
    return () => clearInterval(id);
  }, [isLoadingUI, loadingMessages]);

  const canStart = useMemo(() => {
    if (mode === "create-video") {
      if (!prompt.trim()) return false;
      return true;
    } else if (mode === "create-image") {
      return imagePrompt.trim() && !imagenBusy && !geminiBusy;
    } else if (mode === "edit-image") {
      return editPrompt.trim() && (imageFile || generatedImage) && !geminiBusy;
    } else if (mode === "compose-image") {
      const hasExistingImage = imageFile || generatedImage;
      const hasNewImages = multipleImageFiles.length > 0;
      return (
        composePrompt.trim() &&
        (hasExistingImage || hasNewImages) &&
        !geminiBusy
      );
    } else if (mode === "compose-album") {
      return albumThemeImage && albumItems.length > 0 && !!albumSourceImage && !isGeneratingAlbum;
    }
    return false;
  }, [
    mode,
    prompt,
    imageFile,
    generatedImage,
    imagePrompt,
    editPrompt,
    composePrompt,
    multipleImageFiles,
    imagenBusy,
    geminiBusy,
    albumThemeImage,
    albumItems,
    albumSourceImage,
    isGeneratingAlbum
  ]);

  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setImagePrompt("");
    setEditPrompt("");
    setComposePrompt("");
    setImageFile(null);
    setMultipleImageFiles([]);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setVideoUrl(null);
    setImagenBusy(false);
    setGeminiBusy(false);
    setAlbumItems([]);
    setAlbumThemeImage("");
    setAlbumSourceImage(null);
    setAlbumImages([]);
    setIsGeneratingAlbum(false);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
  };

  const saveToGallery = async (dataUrl: string, promptText: string) => {
    try {
      const [meta, b64] = dataUrl.split(",");
      const mime = meta.split(";")[0].replace("data:", "");

      const resp = await fetch('/api/images/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          prompt: promptText,
          mimeType: mime
        })
      });

      if (!resp.ok) {
        const json = await resp.json();
        console.error('Save API failed:', json);
        // Optional: alert('Failed to save image to gallery: ' + (json.error || resp.statusText));
      }
    } catch (e) {
      console.error('Failed to save to gallery:', e);
    }
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    console.log("Starting Imagen generation");
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Imagen API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Imagen API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        setHistory((prev) => [{
          id: Date.now().toString(),
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: imagePrompt,
          mode: "create-image"
        }, ...prev]);

        // Save to DB
        saveToGallery(dataUrl, imagePrompt);
      } else if (json?.error) {
        console.error("Imagen API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in generateWithImagen:", e);
      alert(`Failed to generate image: ${e.message}`);
    } finally {
      console.log("Resetting Imagen busy state");
      setImagenBusy(false);
    }
  }, [imagePrompt, selectedFolder]);

  // Gemini image generation helper
  const generateWithGemini = useCallback(async () => {
    console.log("Starting Gemini image generation");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        setHistory((prev) => [{
          id: Date.now().toString(),
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: imagePrompt,
          mode: "create-image"
        }, ...prev]);

        // Save to DB
        saveToGallery(dataUrl, imagePrompt);
      } else if (json?.error) {
        console.error("Gemini API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in generateWithGemini:", e);
      alert(`Failed to generate image: ${e.message}`);
    } finally {
      console.log("Resetting Gemini busy state");
      setGeminiBusy(false);
    }
  }, [imagePrompt, selectedFolder]);

  // Gemini image edit helper
  const editWithGemini = useCallback(async () => {
    console.log("Starting Gemini image edit");
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();
      form.append("prompt", editPrompt);

      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
      }

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini edit API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini edit API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        setHistory((prev) => [{
          id: Date.now().toString(),
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: editPrompt,
          mode: "edit-image"
        }, ...prev]);

        // Save to DB
        saveToGallery(dataUrl, editPrompt);
        dispatchCreditUpdate();
      } else if (json?.error) {
        console.error("Gemini edit API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in editWithGemini:", e);
      alert(`Failed to edit image: ${e.message}`);
    } finally {
      console.log("Resetting Gemini busy state after edit");
      setGeminiBusy(false);
    }
  }, [editPrompt, imageFile, generatedImage, selectedFolder]);

  // Gemini image compose helper
  const composeWithGemini = useCallback(async (isRetry = false) => {
    setGeminiBusy(true);
    setGeneratedImage(null);
    try {
      const form = new FormData();
      form.append("prompt", composePrompt);

      for (const file of multipleImageFiles) {
        form.append("imageFiles", file);
      }

      if (imageFile) {
        form.append("imageFiles", imageFile);
      } else if (generatedImage) {
        // If retrying and we have uploaded multiple images, do NOT include the currently generated image
        // as it is likely the result of the previous generation.
        // We want to retry with the ORIGINAL sources (the uploaded files).
        // If we don't have uploaded files, we might be composing on top of a generated image, so we keep it.
        if (!isRetry || multipleImageFiles.length === 0) {
          const [meta, b64] = generatedImage.split(",");
          const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
          const byteCharacters = atob(b64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mime });
          const existingImageFile = new File([blob], "existing-image.png", {
            type: mime,
          });
          form.append("imageFiles", existingImageFile);
        }
      }

      const resp = await fetch("/api/gemini/edit", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
        if (resp.status === 403) throw new Error("Insufficient credits.");
        console.error("Gemini compose API error:", resp.status, resp.statusText);
        throw new Error(`API error: ${resp.status}`);
      }

      const json = await resp.json();
      console.log("Gemini compose API response:", json);

      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        setHistory((prev) => [{
          id: Date.now().toString(),
          imageUrl: dataUrl,
          timestamp: Date.now(),
          folderId: selectedFolder === 'default' ? null : selectedFolder,
          prompt: composePrompt,
          mode: "compose-image"
        }, ...prev]);

        // Save to DB
        saveToGallery(dataUrl, composePrompt);
        dispatchCreditUpdate();
      } else if (json?.error) {
        console.error("Gemini compose API returned error:", json.error);
        throw new Error(json.error);
      }
    } catch (e: any) {
      console.error("Error in composeWithGemini:", e);
      alert(`Failed to compose images: ${e.message}`);
    } finally {
      console.log("Resetting Gemini busy state after compose");
      setGeminiBusy(false);
    }
  }, [composePrompt, multipleImageFiles, imageFile, generatedImage, selectedFolder]);

  const generateAlbum = useCallback(async () => {
    if (!albumSourceImage || albumItems.length === 0) return;

    setIsGeneratingAlbum(true);
    setAlbumImages([]);

    for (const item of albumItems) {
      if (!item.prompt.trim()) continue;

      try {
        const form = new FormData();
        form.append("prompt", item.prompt);
        form.append("imageFiles", albumSourceImage);

        const resp = await fetch("/api/gemini/edit", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
          if (resp.status === 403) throw new Error("Insufficient credits.");
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        if (json?.image?.imageBytes) {
          const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
          setAlbumImages(prev => [...prev, dataUrl]);
          setHistory((prev) => [{
            id: Date.now().toString(),
            imageUrl: dataUrl,
            timestamp: Date.now(),
            folderId: selectedFolder === 'default' ? null : selectedFolder,
            prompt: item.prompt,
            mode: "compose-album"
          }, ...prev]);

          // Save to DB
          saveToGallery(dataUrl, item.prompt);
          dispatchCreditUpdate();
        }
      } catch (e) {
        console.error("Error generating album image", e);
      }
    }
    setIsGeneratingAlbum(false);
  }, [albumItems, albumSourceImage, selectedFolder]);

  const startGeneration = useCallback(async (isRetry = false) => {
    if (!canStart) return;

    if (mode === "create-video") {
      setIsGenerating(true);
      setVideoUrl(null);

      const form = new FormData();
      form.append("prompt", prompt);
      form.append("model", selectedModel);
      if (negativePrompt) form.append("negativePrompt", negativePrompt);
      if (aspectRatio) form.append("aspectRatio", aspectRatio);

      if (imageFile || generatedImage) {
        if (imageFile) {
          form.append("imageFile", imageFile);
        } else if (generatedImage) {
          const [meta, b64] = generatedImage.split(",");
          const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
          form.append("imageBase64", b64);
          form.append("imageMimeType", mime);
        }
      }

      try {
        const resp = await fetch("/api/veo/generate", {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          if (resp.status === 401) throw new Error("Please sign in to start your 14-day free trial with 100 credits!");
          if (resp.status === 403) throw new Error("Insufficient credits.");
          throw new Error(`API error: ${resp.status}`);
        }

        const json = await resp.json();
        setOperationName(json?.name || null);
        if (json?.name) dispatchCreditUpdate();
      } catch (e: any) {
        console.error(e);
        setIsGenerating(false);
        alert(e.message);
      }
    } else if (mode === "create-image") {
      if (selectedModel.includes("imagen")) {
        await generateWithImagen();
      } else {
        await generateWithGemini();
      }
    } else if (mode === "edit-image") {
      await editWithGemini();
    } else if (mode === "compose-image") {
      await composeWithGemini(isRetry);
    } else if (mode === "compose-album") {
      await generateAlbum();
    }
  }, [
    canStart,
    mode,
    prompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    imageFile,
    generatedImage,
    generateWithImagen,
    generateWithGemini,
    editWithGemini,
    composeWithGemini,
    generateAlbum
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const onPickMultipleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      const limitedFiles = imageFiles.slice(0, 10);
      setMultipleImageFiles((prevFiles) =>
        [...prevFiles, ...limitedFiles].slice(0, 10)
      );
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const dispatchCreditUpdate = () => {
    window.dispatchEvent(new Event('credits-updated'));
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      // Convert base64 data URL to blob
      const response = await fetch(generatedImage);
      const blob = await response.blob();

      // Determine file extension from MIME type
      const mimeType = blob.type || "image/png";
      const extension = mimeType.split("/")[1] || "png";
      const safeModelName = selectedModel.replace(/[^a-zA-Z0-9-]/g, "_");
      const filename = `${safeModelName}.${extension}`;

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.setAttribute("download", filename);
      link.setAttribute("rel", "noopener");
      link.target = "_self";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Drag and drop handlers for compose mode
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const limitedFiles = imageFiles.slice(0, 10);

    if (limitedFiles.length > 0) {
      if (mode === "compose-image") {
        setMultipleImageFiles((prevFiles) =>
          [...prevFiles, ...limitedFiles].slice(0, 10)
        );
      } else if (mode === "edit-image") {
        setImageFile(limitedFiles[0]);
      }
    }
  };

  return (
    <div
      className="relative min-h-screen w-full text-stone-900 bg-gradient-to-br from-rose-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="absolute top-4 right-4 z-50">
        <LoginButton />
      </div>
      {/* Main content area */}
      <div
        className={`flex flex-col items-center justify-center min-h-screen pb-96 px-4 transition-all duration-300 ${history.length > 0 ? "pl-64" : ""
          } ${(mode === "edit-image" ||
            mode === "compose-image" ||
            mode === "compose-album")
            ? "pr-96"
            : ""
          }`}
      >
        {!videoUrl &&
          (isLoadingUI ? (
            <div className="w-full max-w-3xl">
              <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
                {mode === "create-video" ? (
                  <Film className="w-16 h-16 text-gray-400 animate-pulse" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-400 animate-pulse" />
                )}
                <div className="inline-flex items-center rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
                  {modelLabel}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {loadingMessages[loadingIndex % loadingMessages.length]}
                </div>
                <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-full w-full animate-[shimmer_1.6s_infinite] -translate-x-full rounded-full bg-gray-400/70 dark:bg-gray-500/70" />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl">
              {((mode === "edit-image" && !imageFile && !generatedImage) ||
                (mode === "create-video" && !imageFile && !generatedImage)) && (
                  <div
                    className={`rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${"bg-white/10 border-gray-300/70 hover:bg-white/30"}`}
                    onClick={() => {
                      // Trigger single file input
                      const input = document.getElementById(
                        "single-image-input"
                      ) as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 text-slate-800/80">
                      <Upload className="w-8 h-8" />
                      <div className="text-center">
                        <div className="font-medium text-lg">
                          Drop an image here, or click to upload
                        </div>
                        <div className="text-sm opacity-80 mt-1">
                          PNG, JPG, WEBP up to 10MB
                        </div>
                        {mode === "edit-image" &&
                          (imageFile || generatedImage) && (
                            <div className="text-sm mt-2 text-green-600">
                              ✓ Image selected
                            </div>
                          )}

                        {mode === "create-video" &&
                          (imageFile || generatedImage) && (
                            <div className="text-sm mt-2 text-green-600">
                              ✓ Image selected for video generation
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

              {mode === "edit-image" && imageFile && uploadedImageUrl && (
                <div
                  className="w-full max-w-4xl aspect-video overflow-hidden rounded-lg border relative mx-auto group cursor-pointer"
                  onClick={() => openPreview(uploadedImageUrl)}
                >
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded for editing"
                    className="w-full h-full object-contain"
                    width={800}
                    height={450}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              )}

              {!(
                mode === "edit-image" ||
                mode === "compose-image" ||
                mode === "compose-album" ||
                mode === "create-video"
              ) && (
                  <div className="text-stone-400 select-none text-center w-full">
                    Nothing to see here
                  </div>
                )}

              {/* Hidden file inputs - always available */}
              <input
                id="single-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickImage}
              />
              <input
                id="multiple-image-input"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickMultipleImages}
              />

              {/* Compose mode initial state when no generated image */}
              {mode === "compose-image" && !generatedImage && (
                <div className="w-full mt-8 flex justify-center">
                  <div className="max-w-3xl">
                    <div className="text-center text-slate-600 mb-6">
                      <div className="text-lg font-medium mb-2">
                        Compose Multiple Images
                      </div>
                      <div className="text-sm opacity-80">
                        Upload multiple images to combine them into a single
                        composition
                      </div>
                    </div>

                    {/* Upload area for compose mode */}
                    <div
                      className={`rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${"bg-white/10 border-gray-300/70 hover:bg-white/30"}`}
                      onClick={() => {
                        const input = document.getElementById(
                          "multiple-image-input"
                        ) as HTMLInputElement;
                        input?.click();
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center gap-3 text-slate-800/80">
                        <Upload className="w-8 h-8" />
                        <div className="text-center">
                          <div className="font-medium text-lg">
                            Drop multiple images here, or click to upload
                          </div>
                          <div className="text-sm opacity-80 mt-1">
                            PNG, JPG, WEBP up to 10MB each (max 10 images)
                          </div>
                          {multipleImageFiles.length > 0 && (
                            <div className="text-sm mt-2 text-green-600">
                              ✓ {multipleImageFiles.length} image
                              {multipleImageFiles.length > 1 ? "s" : ""}{" "}
                              selected{" "}
                              {multipleImageFiles.length >= 10
                                ? "(max reached)"
                                : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thumbnails below dropzone */}
                    {multipleImageFiles.length > 0 && (
                      <div className="mt-6">
                        <div className="flex flex-wrap gap-4 justify-center">
                          {multipleImageFiles.map((file, index) => (
                            <div
                              key={index}
                              className="w-28 h-28 rounded-lg overflow-hidden border-2 border-white/30 shadow-md"
                              title={file.name}
                            >
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                                width={112}
                                height={112}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

        {/* Album Grid */}
        {mode === "compose-album" && (
          <div className="w-full max-w-6xl mt-8 pb-32">
            {albumImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albumImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square relative rounded-lg overflow-hidden border border-white/20 group cursor-pointer"
                    onClick={() => openPreview(img)}
                  >
                    <Image
                      src={img}
                      alt={`Album image ${idx}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
                {isGeneratingAlbum && (
                  <div className="aspect-square rounded-lg border border-white/20 bg-white/5 flex items-center justify-center animate-pulse">
                    <div className="text-xs text-slate-500">Generating...</div>
                  </div>
                )}
              </div>
            ) : (
              !isGeneratingAlbum && (
                <div className="text-center text-slate-500 mt-20">
                  Select a theme and add prompts to generate an album.
                </div>
              )
            )}
          </div>
        )}

        {generatedImage &&
          !videoUrl &&
          !(mode === "create-video" && isLoadingUI) && (
            <div
              className="w-full max-w-4xl aspect-video overflow-hidden rounded-lg border relative mx-auto group cursor-pointer"
              onClick={() => openPreview(generatedImage)}
            >
              <Image
                src={generatedImage}
                alt="Generated result"
                className="w-full h-full object-contain"
                width={800}
                height={450}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startGeneration(true);
                  }}
                  disabled={!canStart}
                  className={`p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all ${!canStart ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                  title="Retry Generation"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openPreview(generatedImage);
                  }}
                  className="p-3 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110"
                  title="View Fullscreen"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Left side history */}
      {
        history.length > 0 && (
          <div className="fixed left-6 top-24 bottom-32 z-20 w-48 overflow-hidden flex flex-col pointer-events-none">
            <div className="pointer-events-auto h-full overflow-y-auto no-scrollbar flex flex-col gap-2 pb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              {/* Search Bar */}
              <div className="mb-2 relative">
                <Search className="absolute left-2 top-1.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full pl-7 pr-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Folder tabs */}
              <div className="flex flex-col gap-1 mb-2">
                {folders
                  .filter(f =>
                    !historySearchQuery ||
                    f.name.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                    f.id === 'default' // Always show 'All Images' unless we want to hide it too, but usually good to keep. Actually, if searching for a specific folder, maybe hide others. Let's keep default if it matches OR if query is empty.
                  )
                  .map((folder) => {
                    const folderItems = folder.id === 'default'
                      ? history
                      : history.filter(item => item.folderId === folder.id);

                    // If searching, also filter items count
                    const matchingItemsCount = historySearchQuery
                      ? folderItems.filter(item => item.prompt?.toLowerCase().includes(historySearchQuery.toLowerCase())).length
                      : folderItems.length;

                    return (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`px-2 py-1 text-xs rounded transition-colors text-left flex justify-between ${selectedFolder === folder.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        <span>{folder.name}</span>
                        <span className="opacity-70">{matchingItemsCount}</span>
                      </button>
                    );
                  })}
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  + New Folder
                </button>
              </div>

              {/* New folder input */}
              {isCreatingFolder && (
                <div className="flex gap-1 mb-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    className="flex-1 px-2 py-1 text-xs border rounded dark:bg-slate-800 dark:border-slate-600"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && newFolderName.trim()) {
                        await createFolder(newFolderName);
                        setNewFolderName('');
                        setIsCreatingFolder(false);
                      } else if (e.key === 'Escape') {
                        setNewFolderName('');
                        setIsCreatingFolder(false);
                      }
                    }}
                    autoFocus
                  />
                </div>
              )}

              {/* History items */}
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center mb-1 uppercase tracking-wider">
                History
              </div>
              {history
                .filter(item => {
                  const matchesFolder = selectedFolder === 'default' || item.folderId === selectedFolder;
                  const matchesSearch = !historySearchQuery || item.prompt?.toLowerCase().includes(historySearchQuery.toLowerCase());
                  return matchesFolder && matchesSearch;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className="w-full aspect-square relative shrink-0 cursor-pointer border-2 border-white/20 hover:border-white/80 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md group"
                    onClick={() => {
                      setGeneratedImage(item.imageUrl);
                      if (item.mode) {
                        setMode(item.mode);
                        if (item.prompt) {
                          if (item.mode === "create-image") setImagePrompt(item.prompt);
                          else if (item.mode === "edit-image") setEditPrompt(item.prompt);
                          else if (item.mode === "compose-image") setComposePrompt(item.prompt);
                        }
                      }
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={`History ${item.id}`}
                      fill
                      className="object-cover"
                    />
                    {generatedImage === item.imageUrl && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-blue-500 rounded-lg" />
                    )}

                    {/* Folder icon with dropdown */}
                    <div className="absolute top-1 left-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenFolderDropdown(openFolderDropdown === item.id ? null : item.id);
                        }}
                        className="p-1 bg-black/50 hover:bg-blue-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        title="Move to folder"
                      >
                        <Folder className="w-3 h-3" />
                      </button>

                      {/* Dropdown menu */}
                      {openFolderDropdown === item.id && (
                        <div className="absolute top-8 left-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 min-w-[120px] py-1 z-20">
                          {folders.filter(f => f.id !== 'default').map((folder) => (
                            <button
                              key={folder.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                const targetFolderId = folder.id === 'default' ? null : folder.id;
                                await assignImageToFolder(item.id, targetFolderId);
                                setOpenFolderDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${item.folderId === folder.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                }`}
                            >
                              {folder.name}
                            </button>
                          ))}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await assignImageToFolder(item.id, null);
                              setOpenFolderDropdown(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border-t border-gray-200 dark:border-slate-700 ${!item.folderId ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                              }`}
                          >
                            No Folder
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this image from history?")) {
                          setHistory((prev) => prev.filter((h) => h.id !== item.id));
                          if (generatedImage === item.imageUrl) {
                            setGeneratedImage(null);
                          }
                        }
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )
      }

      {/* Right side controls */}
      {
        (mode === "edit-image" || mode === "compose-image" || mode === "compose-album") && (
          <div className="fixed right-6 top-24 bottom-32 z-20 w-80 overflow-hidden flex flex-col pointer-events-none">
            <div className="pointer-events-auto h-full overflow-y-auto no-scrollbar">
              {mode === "edit-image" && (
                <PhotoEditorControls
                  onPromptChange={setEditPrompt}
                  onGenerate={startGeneration}
                  isGenerating={isLoadingUI}
                  canGenerate={canStart}
                />
              )}
              {mode === "compose-image" && (
                <ImageComposerControls
                  onPromptChange={setComposePrompt}
                  onGenerate={startGeneration}
                  isGenerating={isLoadingUI}
                  canGenerate={canStart}
                />
              )}
              {mode === "compose-album" && (
                <AlbumComposerControls
                  onAlbumItemsChange={setAlbumItems}
                  onThemeSelect={setAlbumThemeImage}
                  onSourceImageChange={setAlbumSourceImage}
                  onGenerate={startGeneration}
                  isGenerating={isGeneratingAlbum}
                />
              )}
            </div>
          </div>
        )
      }

      {
        videoUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-8">
            <div className="relative w-full max-w-6xl">
              <button
                onClick={() => setVideoUrl(null)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white"
              >
                Close
              </button>
              <VideoPlayer
                src={videoUrl}
                onOutputChanged={handleTrimmedOutput}
                onDownload={downloadVideo}
                onResetTrim={handleResetTrimState}
              />
            </div>
          </div>
        )
      }

      {/* Bottom bar controls */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Composer
              mode={mode}
              setMode={setMode}
              prompt={prompt}
              setPrompt={setPrompt}
              imagePrompt={imagePrompt}
              setImagePrompt={setImagePrompt}
              startGeneration={startGeneration}
              isGenerating={isLoadingUI}
              canStart={canStart}
              resetAll={resetAll}
              downloadImage={downloadImage}
              hasGeneratedImage={!!generatedImage}
              hasVideoUrl={!!videoUrl}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              editPrompt={editPrompt}
              setEditPrompt={setEditPrompt}
              composePrompt={composePrompt}
              setComposePrompt={setComposePrompt}
              geminiBusy={geminiBusy}
            />
          </div>
        </div>
      </div>
    </div >
  );
};

const VeoStudio = () => {
  return (
    <ImagePreviewProvider>
      <VeoStudioContent />
    </ImagePreviewProvider>
  );
};

export default VeoStudio;
