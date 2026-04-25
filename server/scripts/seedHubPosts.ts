// server/scripts/seedHubPosts.ts
// Seeds demo Hub posts + comments. Re-runnable: skips posts whose title is already seeded.
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

type SeedPost = {
  userId: string;
  authorName: string;
  lguTag: string;
  category: "tip" | "warning" | "question" | "experience";
  stepNumber?: number;
  title: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  comments?: Array<{ userId: string; authorName: string; body: string; createdAt: Date }>;
};

const POSTS: SeedPost[] = [
  // ─── Step 1 — DTI Business Name ──────────────────────────────────────
  {
    userId: "demo-jenny-cruz",
    authorName: "Jenny Cruz",
    lguTag: "manila_city",
    category: "tip",
    stepNumber: 1,
    title: "DTI BNRS online — natapos ko in 15 minutes lang!",
    content: "Sa BNRS portal (bnrs.dti.gov.ph), pwede mo na gawing online ang DTI Business Name registration. Bayad ko ₱200 lang for Barangay scope. Email mo ang Certificate after ng GCash payment. Wag na pumila sa Salcedo branch!",
    upvotes: 31,
    downvotes: 0,
    createdAt: new Date("2026-04-22T07:30:00Z"),
    comments: [
      {
        userId: "demo-aling-rosa",
        authorName: "Aling Rosa",
        body: "Salamat! Pinatry ko kahapon, totoong mabilis. Wala na akong dahilan para hindi mag-register.",
        createdAt: new Date("2026-04-22T11:00:00Z"),
      },
    ],
  },
  {
    userId: "demo-mark-villanueva",
    authorName: "Mark Villanueva",
    lguTag: "manila_city",
    category: "warning",
    stepNumber: 1,
    title: "Mag-prepare ng 3 alternative business names!",
    content: "Yung first choice ko sa DTI, taken na pala. Yung second choice, kahawig sa existing trademark kaya rejected. Maganda magdala ng 3-5 alternative names para hindi ka mag-uulit ng application.",
    upvotes: 19,
    downvotes: 0,
    createdAt: new Date("2026-04-21T09:15:00Z"),
  },

  // ─── Step 2 — Barangay Clearance ─────────────────────────────────────
  {
    userId: "demo-tita-bessie",
    authorName: "Tita Bessie",
    lguTag: "manila_city",
    category: "experience",
    stepNumber: 2,
    title: "1 day lang ang Barangay Clearance sa amin sa Sampaloc!",
    content: "Pumunta lang ako sa Barangay Hall ng 8AM, may bakanteng clearance officer. Bayad ko ₱500. Pinasama pa nila yung treasurer's signature kaya same-day release. Tip: dalhin lahat ng valid IDs niyo + kontrata ng tindahan.",
    upvotes: 22,
    downvotes: 0,
    createdAt: new Date("2026-04-19T13:45:00Z"),
  },
  {
    userId: "demo-kuya-rey",
    authorName: "Kuya Rey",
    lguTag: "manila_city",
    category: "question",
    stepNumber: 2,
    title: "Kailangan ba ng Barangay Clearance kung home-based business lang?",
    content: "Online seller ako, walang physical store. Sabi ng iba, kailangan pa rin ng Barangay Clearance kasi nakaregister sa house address. Yung iba naman, sabi exempted. Sino tama?",
    upvotes: 11,
    downvotes: 0,
    createdAt: new Date("2026-04-18T16:20:00Z"),
  },

  // ─── Step 3 — Cedula ──────────────────────────────────────────────────
  {
    userId: "demo-ate-len",
    authorName: "Ate Len",
    lguTag: "manila_city",
    category: "tip",
    stepNumber: 3,
    title: "Cedula sa City Treasurer's Office — bring exact change!",
    content: "₱55 lang ang Cedula ko, pero walang sukli sa cashier. Naghintay ako 30 mins habang naghahanap sila ng barya. Bring exact change or 100/50 peso bills. Tapos na in 15 minutes.",
    upvotes: 14,
    downvotes: 0,
    createdAt: new Date("2026-04-17T10:00:00Z"),
  },

  // ─── Step 5 — BIR Registration ───────────────────────────────────────
  {
    userId: "demo-mang-tonyo",
    authorName: "Mang Tonyo",
    lguTag: "manila_city",
    category: "experience",
    stepNumber: 5,
    title: "BIR RDO 32 — pumunta ng maaga, mag-online appointment!",
    content: "Naka-online appointment ako via BIR website (eAppointment system). 7AM appointment, tapos sa 10AM may COR (Form 2303) na ako. Kasama na ang ATP (Authority to Print) para sa OR. Total fees: ₱530 (₱500 registration + ₱30 docstamp). Walang nag-offer ng fixer dahil walang pila!",
    upvotes: 36,
    downvotes: 0,
    createdAt: new Date("2026-04-16T11:30:00Z"),
    comments: [
      {
        userId: "demo-jenny-cruz",
        authorName: "Jenny Cruz",
        body: "Online appointment FTW. Yung iba kong friends inabot ng buong araw kasi walk-in.",
        createdAt: new Date("2026-04-16T14:00:00Z"),
      },
      {
        userId: "demo-tatay-jun",
        authorName: "Tatay Jun",
        body: "Pakishare yung exact link ng eAppointment? Hinahanap ko kahapon hindi ko mahanap.",
        createdAt: new Date("2026-04-17T08:15:00Z"),
      },
    ],
  },
  {
    userId: "demo-ana-reyes",
    authorName: "Ana Reyes",
    lguTag: "manila_city",
    category: "warning",
    stepNumber: 5,
    title: "Wag kalimutang i-stamp ang Books of Accounts!",
    content: "Nakuha ko na yung COR ko, pero hindi ko alam na kailangan ko pang i-register at i-stamp ang Cash Receipt + Cash Disbursement journal sa BIR. Bumalik pa ako kinabukasan. Make sure all 4 books mo dala mo: Journal, Ledger, Cash Receipt, Cash Disbursement.",
    upvotes: 28,
    downvotes: 0,
    createdAt: new Date("2026-04-14T09:00:00Z"),
  },

  // ─── General / cross-step ─────────────────────────────────────────────
  {
    userId: "demo-ate-grace",
    authorName: "Ate Grace",
    lguTag: "manila_city",
    category: "tip",
    title: "Photocopy ng IDs — gawin sa labas, mas mura!",
    content: "Yung photocopy sa loob ng City Hall, ₱5/page. Sa labas (sa mga tindahan sa Arroceros), ₱2/page lang. Magdala kayo ng 3 sets ng photocopy ng valid ID + proof of address bago pumasok.",
    upvotes: 17,
    downvotes: 0,
    createdAt: new Date("2026-04-13T08:00:00Z"),
  },
  {
    userId: "demo-kuya-pol",
    authorName: "Kuya Pol",
    lguTag: "manila_city",
    category: "question",
    title: "Gaano katagal bago mag-renew ng Mayor's Permit?",
    content: "First year ko mag-rerenew this January. Kailan ko dapat simulan? Kailangan ba ulit ng Barangay Clearance + Cedula? Ano ang renewal fees usually?",
    upvotes: 9,
    downvotes: 0,
    createdAt: new Date("2026-04-11T15:00:00Z"),
  },

  // ─── Step 4 retroactive comments on existing fixer-warning post ───────
  // (handled separately via COMMENTS_ON_WARNING_POST below)
];

// Original 4 posts (preserved for first-time seeding)
const ORIGINAL_POSTS: SeedPost[] = [
  {
    userId: "demo-aling-rosa",
    authorName: "Aling Rosa",
    lguTag: "manila_city",
    category: "tip",
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
    category: "warning",
    stepNumber: 4,
    title: "Mag-ingat sa mga fixer sa labas ng City Hall!",
    content: "May mga tao sa labas ng Manila City Hall na mag-ooffer na 'tulungan' kayo sa permit. Huwag kayong papayag — ₱3,000-₱5,000 ang singil nila para sa process na kaya niyong gawin mag-isa. Lahat ng info nasa NegosyoNav na! Kaya niyo 'to!",
    upvotes: 42,
    downvotes: 0,
    createdAt: new Date("2026-04-18T10:00:00Z"),
    comments: [
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
    ],
  },
  {
    userId: "demo-maria-santos",
    authorName: "Maria Santos",
    lguTag: "manila_city",
    category: "experience",
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
    category: "question",
    stepNumber: 4,
    title: "Kailangan ba talaga ng Fire Safety Certificate para sa sari-sari store?",
    content: "Nag-apply ako ng Mayor's Permit para sa maliit na sari-sari store sa Tondo. Sabi nila kailangan ko ng FSIC from BFP. Pero maliit lang naman ang tindahan ko, attached sa bahay. May exemption ba para sa ganito?",
    upvotes: 8,
    downvotes: 0,
    createdAt: new Date("2026-04-12T09:00:00Z"),
  },
];

async function main() {
  const col = adminDb!.collection("community_posts");

  // Build set of existing seed titles to skip duplicates.
  const existing = await col.where("seed", "==", true).get();
  const existingTitles = new Set<string>();
  existing.forEach(d => {
    const t = d.data().title;
    if (typeof t === "string") existingTitles.add(t);
  });

  const all = [...ORIGINAL_POSTS, ...POSTS];
  let created = 0;
  let commentsCreated = 0;

  for (const p of all) {
    if (existingTitles.has(p.title)) {
      console.log(`  · skip   "${p.title.slice(0, 60)}" (already seeded)`);
      continue;
    }
    const doc: Record<string, unknown> = {
      userId: p.userId,
      authorName: p.authorName,
      lguTag: p.lguTag,
      category: p.category,
      title: p.title,
      content: p.content,
      upvotes: p.upvotes,
      downvotes: p.downvotes,
      isFlagged: false,
      commentCount: p.comments?.length ?? 0,
      seed: true,
      createdAt: p.createdAt,
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (typeof p.stepNumber === "number") doc.stepNumber = p.stepNumber;
    const ref = await col.add(doc);
    created += 1;
    console.log(`  + ${p.category.padEnd(11)} ${ref.id}  ${p.title.slice(0, 60)}`);

    if (p.comments && p.comments.length > 0) {
      const commentsCol = col.doc(ref.id).collection("comments");
      for (const c of p.comments) {
        const cref = await commentsCol.add(c);
        commentsCreated += 1;
        console.log(`    └ comment ${cref.id} from ${c.authorName}`);
      }
    }
  }

  console.log(`\nSeeded ${created} new posts + ${commentsCreated} comments. (${existingTitles.size} already existed.)`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
