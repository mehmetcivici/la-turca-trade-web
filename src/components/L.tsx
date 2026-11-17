import NextLink from "next/link";
import type { ComponentProps } from "react";

/** next/link, arka plan ön yüklemesi kapalı (paylaşımlı sunucuya gereksiz istek gitmesin). */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
