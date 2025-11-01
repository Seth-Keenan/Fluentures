// app/lib/hooks/useDisplayName.ts
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type DisplayNameState = { name: string; loading: boolean; error?: string };

export function useDisplayName(): DisplayNameState {
  const supabase = createClientComponentClient();
  const [state, setState] = useState<DisplayNameState>({ name: "", loading: true });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        if (!cancelled) setState({ name: "Friend", loading: false, error: userErr?.message });
        return;
      }

      // 1) Try Users table (prefer full_name; fallback to fname/lname)
      const { data: row, error: rowErr } = await supabase
        .from("Users")
        .select("fname")
        .eq("user_id", user.id)
        .single();

      const pickUsersName = () => {
        if (!row) return "";
        const fromFull = (row as any)?.full_name?.trim?.();
        if (fromFull) return fromFull;
        const f = (row as any)?.fname?.trim?.() ?? "";
        const l = (row as any)?.lname?.trim?.() ?? "";
        return `${f} ${l}`.trim();
      };

      let name = pickUsersName();

      // 2) Fallback: auth user_metadata name fields (NO email fallback)
      if (!name) {
        const m = user.user_metadata || {};
        name =
          m.name?.trim?.() ||
          m.full_name?.trim?.() ||
          (m.first_name && m.last_name ? `${m.first_name} ${m.last_name}`.trim() : "") ||
          (m.given_name && m.family_name ? `${m.given_name} ${m.family_name}`.trim() : "") ||
          m.preferred_username?.trim?.() ||
          m.username?.trim?.() ||
          m.user_name?.trim?.() ||
          "";
      }

      if (!cancelled) {
        setState({
          name: name || "Friend",
          loading: false,
          error: rowErr?.message,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return state;
}
