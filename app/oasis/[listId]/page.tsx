"use client";

import { useParams } from "next/navigation";
import { LinkAsButton } from "@/app/components/LinkAsButton";

export default function OasisHubPage() {
  const { listId } = useParams<{ listId: string }>();

  if (!listId) {
    return <div className="p-6">Missing list id.</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-3">
      <LinkAsButton href={`/oasis/${listId}/quiz`} className="btn">
        Quiz
      </LinkAsButton>

      <LinkAsButton href={`/oasis/${listId}/story`} className="btn">
        Story
      </LinkAsButton>

      <LinkAsButton href={`/oasis/${listId}/sentences`} className="btn">
        Sentences
      </LinkAsButton>

      <LinkAsButton href={`/oasis/${listId}/edit`} className="btn">
        Edit Oasis
      </LinkAsButton>

      <LinkAsButton href="/map" className="btn">
        Back
      </LinkAsButton>
    </div>
  );
}
