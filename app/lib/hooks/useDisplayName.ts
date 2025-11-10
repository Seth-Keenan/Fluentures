// app/lib/hooks/useDisplayName.ts
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type DisplayNameState = { name: string; loading: boolean; error?: string };
type UserRow = {
        full_name?: string | null;
        fname?: string | null;
        lname?: string | null; 
      };

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
      const { data: userRow, error: rowErr } = await supabase
        .from("Users")
        .select("fname")
        .eq("user_id", user.id)
        .single();
      
      const pickUsersName = (row?: UserRow | null): string => {
        if (!row) return "";
        const fromFull = row.full_name?.trim?.();
        if (fromFull) return fromFull;
        const f = row.fname?.trim?.() ?? "";
        const l = row.lname?.trim?.() ?? "";
        return `${f} ${l}`.trim();
      };

      let name = pickUsersName(userRow);

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
