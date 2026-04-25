// server/scripts/seedHubPosts.ts
// Seeds four demo Hub posts + 2 comments on the fixer-warning post.
// Idempotent: aborts if any doc with seed: true exists.
// Run: pnpm seed:hub  (requires serviceAccount.json + NODE_ENV != production)

import "../_core/firebaseAdmin";
import { adminDb } from "../_core/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}
if (!adminDb) {
  console.error("Firestore not initialized — is serviceAccount.json present?");
  process.exit(1);
}

const POSTS = [
  {
    userId: "demo-aling-rosa",
    authorName: "Aling Rosa",
    lguTag: "manila_city",
    category: "tip" as const,
    stepNumber: 4,
    title: "Mabilis lang kumuha ng permit sa E-BOSS Lounge!",
    content: "Kung pupunta kayo sa Manila City Hall para sa Mayor's Permit, diretso kayo sa E-BOSS Lounge sa Ground Floor. Hindi kayo kailangan pumila sa Room 110. Natapos ako in 2 hours lang! Bring complete documents ha.",
    upvotes: 24,
    downvotes: 1,
    createdAt: new Date("2026-04-20T08:00:00Z"),
  },
  {
    userId: "demo-kuya-ben",
    authorName: "Kuya Ben",
    lguTag: "manila_city",
    category: "warning" as const,
    stepNumber: 4,
    title: "Mag-ingat sa mga fixer sa labas ng City Hall!",
    content: "May mga tao sa labas ng Manila City Hall na mag-ooffer na 'tulungan' kayo sa permit. Huwag kayong papayag — ₱3,000-₱5,000 ang singil nila para sa process na kaya niyong gawin mag-isa. Lahat ng info nasa NegosyoNav na! Kaya niyo 'to!",
    upvotes: 42,
    downvotes: 0,
    createdAt: new Date("2026-04-18T10:00:00Z"),
  },
  {
    userId: "demo-maria-santos",
    authorName: "Maria Santos",
    lguTag: "manila_city",
    category: "experience" as const,
    title: "Nakapag-register na ako ng carinderia ko sa Sampaloc!",
    content: "Salamat sa NegosyoNav! Hindi ko alam dati na kailangan ko pala ng Cedula bago Mayor's Permit. Natapos ko lahat in 1 week lang. Total gastos ko: ₱6,200. Nag-apply din ako sa BMBE para sa tax exemption. Kaya niyo rin 'to mga ka-negosyante!",
    upvotes: 18,
    downvotes: 0,
    createdAt: new Date("2026-04-15T14:00:00Z"),
  },
  {
    userId: "demo-tatay-jun",
    authorName: "Tatay Jun",
    lguTag: "manila_city",
    category: "question" as const,
    stepNumber: 4,
    title: "Kailangan ba talaga ng Fire Safety Certificate para sa sari-sari store?",
    content: "Nag-apply ako ng Mayor's Permit para sa maliit na sari-sari store sa Tondo. Sabi nila kailangan ko ng FSIC from BFP. Pero maliit lang naman ang tindahan ko, attached sa bahay. May exemption ba para sa ganito?",
    upvotes: 8,
    downvotes: 0,
    createdAt: new Date("2026-04-12T09:00:00Z"),
  },
];

const COMMENTS_ON_WARNING_POST = [
  {
    userId: "demo-aling-rosa",
    authorName: "Aling Rosa",
    body: "Totoo 'to! Halos napaglaruan ako noong una. Mabuti at hindi ako pumayag.",
    createdAt: new Date("2026-04-19T03:00:00Z"),
  },
  {
    userId: "demo-maria-santos",
    authorName: "Maria Santos",
    body: "+1. Ang tagal nilang mag-explain pero kapag tinanong mo lang sa guard, libre namang sagot.",
    createdAt: new Date("2026-04-19T05:30:00Z"),
  },
];

async function main() {
  const col = adminDb!.collection("community_posts");

  const existing = await col.where("seed", "==", true).limit(1).get();
  if (!existing.empty) {
    console.log("Seed posts already present — aborting (idempotent).");
    return;
  }

  let warningPostId: string | null = null;

  for (const p of POSTS) {
    const ref = await col.add({
      ...p,
      isFlagged: false,
      commentCount: p.category === "warning" ? COMMENTS_ON_WARNING_POST.length : 0,
      seed: true,
      updatedAt: FieldValue.serverTimestamp(),
    });
    if (p.category === "warning") warningPostId = ref.id;
    console.log(`  + ${p.category.padEnd(11)} ${ref.id}  ${p.title.slice(0, 60)}`);
  }

  if (warningPostId) {
    const commentsCol = col.doc(warningPostId).collection("comments");
    for (const c of COMMENTS_ON_WARNING_POST) {
      const ref = await commentsCol.add(c);
      console.log(`    └ comment ${ref.id} from ${c.authorName}`);
    }
  }

  console.log(`Seeded ${POSTS.length} posts + ${COMMENTS_ON_WARNING_POST.length} comments.`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
