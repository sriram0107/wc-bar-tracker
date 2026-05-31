import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebaseAdmin";

const VISITOR_COOKIE = "wc_vid";
const STATS_DOC_PATH = { collection: "meta", id: "site_stats" } as const;

export { VISITOR_COOKIE };

export interface SiteVisitorStats {
  uniqueVisitors: number;
  totalVisits: number;
  updatedAt: string | null;
}

/**
 * Record a visit for an anonymous visitor id (from first-party cookie).
 * Increments unique_visitors only the first time we see this id.
 */
export async function recordVisitorHit(
  visitorId: string
): Promise<{ isNewVisitor: boolean }> {
  const db = getAdminFirestore();
  const visitorRef = db.collection("visitors").doc(visitorId);
  const statsRef = db
    .collection(STATS_DOC_PATH.collection)
    .doc(STATS_DOC_PATH.id);

  return db.runTransaction(async (tx) => {
    const visitorSnap = await tx.get(visitorRef);
    const statsSnap = await tx.get(statsRef);

    const isNewVisitor = !visitorSnap.exists;
    const stats = statsSnap.data() ?? {
      unique_visitors: 0,
      total_visits: 0,
    };

    const prevVisits =
      typeof stats.total_visits === "number" ? stats.total_visits : 0;
    const prevUnique =
      typeof stats.unique_visitors === "number" ? stats.unique_visitors : 0;

    tx.set(
      visitorRef,
      {
        first_seen: isNewVisitor
          ? FieldValue.serverTimestamp()
          : visitorSnap.data()?.first_seen ?? FieldValue.serverTimestamp(),
        last_seen: FieldValue.serverTimestamp(),
        visit_count: (visitorSnap.data()?.visit_count ?? 0) + 1,
      },
      { merge: true }
    );

    tx.set(
      statsRef,
      {
        unique_visitors: prevUnique + (isNewVisitor ? 1 : 0),
        total_visits: prevVisits + 1,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { isNewVisitor };
  });
}

/** Read aggregate unique visitor count from Firestore */
export async function getSiteVisitorStats(): Promise<SiteVisitorStats> {
  const db = getAdminFirestore();
  const snap = await db
    .collection(STATS_DOC_PATH.collection)
    .doc(STATS_DOC_PATH.id)
    .get();

  if (!snap.exists) {
    return { uniqueVisitors: 0, totalVisits: 0, updatedAt: null };
  }

  const data = snap.data()!;
  const updated = data.updated_at;
  let updatedAt: string | null = null;
  if (updated && typeof updated.toDate === "function") {
    updatedAt = updated.toDate().toISOString();
  }

  return {
    uniqueVisitors:
      typeof data.unique_visitors === "number" ? data.unique_visitors : 0,
    totalVisits: typeof data.total_visits === "number" ? data.total_visits : 0,
    updatedAt,
  };
}
