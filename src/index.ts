import { isAndroid, isIOS } from "./getPlatform";

export * from "./getPlatform";

export const getLocalDevDomain = (port: number) => {
  let result: string | undefined = undefined;

  if (isAndroid) {
    result = `http://10.0.2.2:${port}`;
  } else if (isIOS) {
    result = `http://localhost:${port}`;
  }

  return result;
};
