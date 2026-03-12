import { adminDb } from "@/lib/firebaseAdmin";

export default async function VerifyPage({ params }: any) {
  const doc = await adminDb
    .collection("registrations_flat")
    .doc(params.registrationId)
    .get();

  if (!doc.exists) {
    return <div>Certificate not found</div>;
  }

  const runner: any = doc.data();

  return (
    <div style={{ padding: 40 }}>
      <h1>Certificate Verification</h1>

      <p>Name: {runner.name}</p>

      <p>Bib: {runner.bibNumber}</p>

      <p>Time: {runner.result?.netTime}</p>

      <p>Rank: {runner.result?.overallRank}</p>

      <p>Status: Verified ✓</p>
    </div>
  );
}
