import { shallowRef } from 'vue';

interface CropApi {
  apply: () => void;
  cancel: () => void;
  setAspect: (ratio: number) => void;
}

const cropApi = shallowRef<CropApi | null>(null);

export function provideCropApi(api: CropApi) {
  cropApi.value = api;
}

export function clearCropApi() {
  cropApi.value = null;
}

export function useCropControls() {
  return cropApi;
}
