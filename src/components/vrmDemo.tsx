import { useContext, useCallback, useEffect, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";

export default function VrmDemo({
  vrmUrl,
  onScreenShot,
  onLoaded,
  onError,
}: {
  vrmUrl: string,
  onScreenShot?: (blob: Blob | null) => void;
  onLoaded?: () => void,
  onError?: () => void,
}) {
  
  const { viewer } = useContext(ViewerContext);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setLoadingError(false);
  }, [vrmUrl]);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        (new Promise(async (resolve, reject) => {
          try {
            const loaded = await viewer.loadVrm(buildUrl(vrmUrl));
            resolve(true);
          } catch (e) {
            reject();
          }
        }))
        .then(() => {
          console.log("vrm loaded");
          setIsLoading(false);
          setLoadingError(false);
          onLoaded && onLoaded();
        })
        .then(() => {if (onScreenShot) return new Promise(resolve => setTimeout(resolve, 300));})
        .then(() => {if (onScreenShot) viewer.getScreenshotBlob(onScreenShot);})
        .catch((e) => {
          console.error("vrm loading error", e);
          setLoadingError(true);
          setIsLoading(false);
          onError && onError();
        });
      }
   },
   [viewer, vrmUrl]
  );

  return (
    <div>
      <canvas ref={canvasRef} className={"h-full w-full"} />
      {isLoading && (
        <div className={"text-gray-500 p-2 text-2xl"}>Loading...</div>
      )}
      {loadingError && (
        <div className={"p-2 text-2xl"}>Error loading VRM model...</div>
      )}
    </div>
  );
}

