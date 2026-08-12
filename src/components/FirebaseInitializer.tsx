import { useEffect } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { TREATMENTS, PRACTITIONERS } from "../data";

export const FirebaseInitializer = () => {
    useEffect(() => {
        const seedData = async () => {
            try {
                const treatmentsSnapshot = await getDocs(collection(db, "treatments"));
                if (treatmentsSnapshot.empty) {
                    const batch = writeBatch(db);
                    TREATMENTS.forEach(t => {
                        batch.set(doc(db, "treatments", t.id), t);
                    });
                    await batch.commit();
                }
                const practitionersSnapshot = await getDocs(collection(db, "practitioners"));
                if (practitionersSnapshot.empty) {
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
        seedData();
    }, []);
    return null;
}
