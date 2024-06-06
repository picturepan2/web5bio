import { NextRequest } from "next/server";
import { resolveENSHandle } from "../../ens/[handle]/utils";
import {
  errorHandle,
  respondWithCache,
} from "../../../../../components/utils/utils";
import { PlatformType } from "../../../../../components/utils/platform";
import { regexEns, regexEth } from "../../../../../components/utils/regexp";
import { ErrorMessages } from "../../../../../components/utils/types";

const resolveEtheruemRespond = async (handle: string) => {
  try {
    const json = await resolveENSHandle(handle);
    return respondWithCache(JSON.stringify(json));
  } catch (e: any) {
    return errorHandle({
      identity: handle,
      platform: PlatformType.ens,
      code: e.cause || 500,
      message: e.message,
    });
  }
};
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const inputName = searchParams.get("handle") || "";
  const lowercaseName = inputName?.toLowerCase();
  if (!regexEns.test(lowercaseName) && !regexEth.test(lowercaseName))
    return errorHandle({
      identity: lowercaseName,
      platform: PlatformType.ethereum,
      code: 404,
      message: ErrorMessages.invalidIdentity,
    });
  return resolveEtheruemRespond(lowercaseName);
}

export const runtime = "edge";
export const preferredRegion = ["hnd1", "sfo1"];