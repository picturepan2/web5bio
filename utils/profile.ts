import { PlatformType } from "./platform";

export interface ProfileInterface {
  uuid: string;
  address: string;
  addresses: Record<string, string>;
  avatar: string | null;
  description: string | null;
  platform: string;
  displayName: string | null;
  email: string | null;
  header: string | null;
  identity: string;
  location: string | null;
  links: Record<
    PlatformType,
    {
      link: string;
      handle: string;
    }
  >;
}

export enum WidgetTypes {
  nft = "nft",
  poaps = "poaps",
  feeds = "feeds",
  rss = "rss",
  degen = "degen",
  phi = "phi",
  default = "default",
}
