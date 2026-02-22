import ChipMappingClient from "./ChipMappingClient";

export default async function ChipMappingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ChipMappingClient eventId={id} />;
}
