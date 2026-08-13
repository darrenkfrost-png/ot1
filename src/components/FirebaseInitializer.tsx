import { useEffect } from "react";
import { TREATMENTS, PRACTITIONERS } from "../data";

/**
 * Seeds the treatment and practitioner collections the first time the database
 * is found empty.
 *
 * Firebase is pulled in dynamically rather than at the top of the file. Imported
 * statically it landed in the entry bundle, so every visitor downloaded the
 * Firestore and Auth clients before the first page could paint - to run a job
 * that only matters once, and only when the database is empty. It is also held
 * back until the browser is idle so it never competes with the first render.
 */
export const FirebaseInitializer = () => {
    useEffect(() => {
        let cancelled = false;

        const seedData = async () => {
            try {
                const [{ collection, getDocs, writeBatch, doc }, { db }] = await Promise.all([
                    import("firebase/firestore"),
                    import("../lib/firebase"),
                ]);
                if (cancelled) return;

                const treatmentsSnapshot = await getDocs(collection(db, "treatments"));
                if (!cancelled && treatmentsSnapshot.empty) {
                    const batch = writeBatch(db);
                    TREATMENTS.forEach(t => {
                        batch.set(doc(db, "treatments", t.id), t);
                    });
                    await batch.commit();
                }

                const practitionersSnapshot = await getDocs(collection(db, "practitioners"));
                if (!cancelled && practitionersSnapshot.empty) {
                    const batch = writeBatch(db);
                    PRACTITIONERS.forEach(p => {
                        batch.set(doc(db, "practitioners", p.id), p);
                    });
                    await batch.commit();
                }
            } catch (e) {
                console.error("Seeding error", e);
            }
        };

        const idle = (window as any).requestIdleCallback as
            | ((cb: () => void, opts?: { timeout: number }) => number)
            | undefined;

        if (idle) {
            const handle = idle(() => { void seedData(); }, { timeout: 4000 });
            return () => {
                cancelled = true;
                (window as any).cancelIdleCallback?.(handle);
            };
        }

        const timer = setTimeout(() => { void seedData(); }, 1500);
        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    return null;
}
