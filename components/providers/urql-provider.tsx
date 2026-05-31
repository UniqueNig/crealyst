"use client";

import { Provider } from "urql";
import { useState } from "react";
import { getUrqlClient } from "@/lib/urql/client";

export function UrqlProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => getUrqlClient());
  return <Provider value={client}>{children}</Provider>;
}
