// app/map/edit/page.tsx
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import MapEditView from "./client";
import { deleteListAction, createListAction } from "./actions"; 
import { deserts } from "@/app/data/deserts";
import PageBackground from "@/app/components/PageBackground";

type WordListRow = {
  word_list_id: string;
  word_list_name: string | null;
  language: string | null;
};

export const metadata = {
  title: "Fluentures | Edit Map",
  icons: { icon: "/favicon.ico" },
};

export default async function MapEditPage() {
  const supabase = await getSupabaseServerActionClient();
  const desert = deserts.find(d => d.name === "Salar de Uyuni")!;


  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6 gap-3">
        <h1 className="text-xl font-semibold">Not logged in</h1>
        <p className="text-sm text-neutral-500">Please log in to manage your oases.</p>
        <LinkAsButton href="/home" className="btn mt-2">
          Back to Home
        </LinkAsButton>
      </div>
    );
  }

  // Current language
  const { data: setting } = await supabase
    .from("UserSettings")
    .select("language")
    .eq("user_id", user.id)
    .maybeSingle();
  const selectedLanguage = setting?.language?.trim() || null;

  // Lists: user-scoped, optional language filter
  let query = supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (selectedLanguage) {
    query = query.eq("language", selectedLanguage);
  }

  const { data } = await query;
  const rows = (data ?? []) as WordListRow[];

  const wordlists = rows.map((r) => ({
    id: r.word_list_id,
    title: r.word_list_name || "(Untitled)",
    language: r.language,
  }));

  return (
    <PageBackground
      src={desert.src}
      alt={desert.name}
      wikiUrl={desert.wikiUrl}
    >
      <div className="relative flex flex-col items-center min-h-screen p-6 gap-5 w-full">
        {/* Aurora blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
          }}
        />
        {/* Grain + veil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
            backgroundSize: "160px 160px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl flex flex-col gap-5">
        <header className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white drop-shadow">Edit Map</h1>
          <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-xs text-white bg-white/10 backdrop-blur-sm">
            <span className="mr-1 opacity-70">Language:</span>
            <strong>{selectedLanguage ?? "All"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LinkAsButton href="/map" className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30">
            Back
          </LinkAsButton>
        </div>
      </header>

        {/* 3D editor */}
        <section className="rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="h-[70vh]">
            <MapEditView
              wordlists={wordlists}
              deleteAction={deleteListAction}
              createAction={createListAction}
            />
          </div>
        </section>
        </div>
      </div>
    </PageBackground>
  );
}
