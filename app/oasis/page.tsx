"use client";

import { useSearchParams } from "next/navigation";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasis } from "../context/OasisContext";
import { useEffect } from "react";

export default function OasisHubPage() {
  const searchParams = useSearchParams();
  const { oasisId, setOasisId } = useOasis();

  useEffect(() => {
    const id = searchParams?.get("id");
    if (id) setOasisId(id);
  }, [searchParams, setOasisId]);

  if (!oasisId) {
    return <div>Missing list id.</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-3">
      <LinkAsButton href={`/oasis/quiz`} className="btn">
        Quiz
      </LinkAsButton>

      <LinkAsButton href={`/oasis/story`} className="btn">
        Story
      </LinkAsButton>

      <LinkAsButton href={`/oasis/sentences`} className="btn">
        Sentences
      </LinkAsButton>

      <LinkAsButton href={`/oasis/edit`} className="btn">
        Edit Oasis
      </LinkAsButton>

      <LinkAsButton href="/map" className="btn">
        Back
      </LinkAsButton>
    </div>
  );
}
