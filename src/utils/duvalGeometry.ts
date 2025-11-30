

export interface Point {
    x: number;
    y: number;
}

export interface LineSegment {
    start: Point;
    end: Point;
}

export interface Label {
    text: string;
    position: Point;
}

export interface DuvalGeometry {
    lines: LineSegment[];
    labels: Label[];
}

// Helper to calculate triangle coordinates from percentages
// p1 = Top (Gas 1), p2 = Right (Gas 2), p3 = Left (Gas 3)
const getCoord = (p1: number, p2: number, p3: number): Point => {
    // Ensure they sum to 100 (or close enough)
    // We assume the inputs are correct percentages
    // x = p2 + 0.5 * p1
    // y = (sqrt(3) / 2) * p1
    // But this assumes a specific scale. Let's normalize to 0-100 scale for drawing.
    // The canvas will scale this up.
    // Wait, standard barycentric to Cartesian:
    // If vertices are:
    // Top: (50, 86.6)
    // Right: (100, 0)
    // Left: (0, 0)
    // Then P = p1*Top + p2*Right + p3*Left
    // x = p1*0.5 + p2*1 + p3*0 = 0.5*p1 + p2
    // y = p1*0.866 + p2*0 + p3*0 = 0.866*p1
    // This matches the logic in duvalAnalysis.ts (except y is inverted in canvas usually)
    // In duvalAnalysis.ts: y = (Math.sqrt(3) / 2) * p1.
    // This means y increases as p1 increases. So p1=100 is at y=86.6.
    // In Canvas, y=0 is top. So we need to invert y when drawing.
    // But here we just return abstract coordinates.

    return {
        x: p2 + 0.5 * p1,
        y: (Math.sqrt(3) / 2) * p1
    };
};

// Helper to get point from 2 known gas values.
// We need to know WHICH gases they are to assign to p1, p2, p3.
// Method 1: Gas1=CH4(Top), Gas2=C2H4(Right), Gas3=C2H2(Left)
// Method 4: Gas1=H2(Top), Gas2=CH4(Right), Gas3=C2H6(Left)
// Method 5: Gas1=CH4(Top), Gas2=C2H4(Right), Gas3=C2H6(Left)

type GasKey = 'gas1' | 'gas2' | 'gas3';

const getPointFromGases = (
    g1: { key: GasKey; value: number } | null,
    g2: { key: GasKey; value: number } | null,
    g3: { key: GasKey; value: number } | null
): Point => {
    let p1 = 0, p2 = 0, p3 = 0;

    // We need exactly 2 values to determine the 3rd, or 3 values.
    // If 2 are given, 3rd is 100 - sum.

    if (g1 && g2) {
        p1 = g1.value;
        p2 = g2.value;
        p3 = 100 - p1 - p2;
    } else if (g1 && g3) {
        p1 = g1.value;
        p3 = g3.value;
        p2 = 100 - p1 - p3;
    } else if (g2 && g3) {
        p2 = g2.value;
        p3 = g3.value;
        p1 = 100 - p2 - p3;
    } else {
        // Fallback or error
        return { x: 0, y: 0 };
    }

    return getCoord(p1, p2, p3);
};

// --- Triangle 1 Definitions ---
// Gas1: CH4 (Top), Gas2: C2H4 (Right), Gas3: C2H2 (Left)
const getT1Point = (
    c2h2: number | null,
    c2h4: number | null,
    ch4: number | null
): Point => {
    return getPointFromGases(
        ch4 !== null ? { key: 'gas1', value: ch4 } : null,
        c2h4 !== null ? { key: 'gas2', value: c2h4 } : null,
        c2h2 !== null ? { key: 'gas3', value: c2h2 } : null
    );
};

const T1_LINES: LineSegment[] = [
    // Based on standard Duval Triangle 1 (IEC 60599)
    // 1. C2H4 = 23 (Separating line between D1/D2 and T1/T2)
    {
        start: getT1Point(null, 23, 0), // Bottom Edge
        end: getT1Point(0, 23, null)    // Right Edge
    },

    // 2. C2H4 = 9 (Lower boundary for PD region)
    {
        start: getT1Point(null, 9, 0), // Bottom Edge
        end: getT1Point(0, 9, null)    // Right Edge
    },

    // 3. C2H2 = 13 (Separates thermal faults from discharge faults)
    {
        start: getT1Point(13, 0, null), // Left Edge
        end: getT1Point(13, null, 0)    // Bottom Edge
    },

    // 4. CH4 = 98 (Separates PD from rest in low C2H4 region)
    {
        start: getT1Point(null, 9, 98), // Intersection with C2H4=9
        end: getT1Point(0, null, 98)    // Right Edge
    }
];

const T1_LABELS: Label[] = [
    { text: 'PD', position: getT1Point(2, 3, 95) },
    { text: 'T1', position: getT1Point(4, 15, 81) },
    { text: 'T2', position: getT1Point(4, 50, 46) },
    { text: 'T3', position: getT1Point(8, 35, 57) },
    { text: 'D1', position: getT1Point(35, 15, 50) },
    { text: 'D2', position: getT1Point(30, 50, 20) },
    { text: 'DT', position: getT1Point(40, 3, 57) },
];

// --- Triangle 4 Definitions ---
// Gas1: H2 (Top), Gas2: CH4 (Right), Gas3: C2H6 (Left)
const getT4Point = (
    c2h6: number | null,
    ch4: number | null,
    h2: number | null
): Point => {
    return getPointFromGases(
        h2 !== null ? { key: 'gas1', value: h2 } : null,
        ch4 !== null ? { key: 'gas2', value: ch4 } : null,
        c2h6 !== null ? { key: 'gas3', value: c2h6 } : null
    );
};

const T4_LINES: LineSegment[] = [
    // Based on standard Duval Triangle 4 (IEC 60599)
    // 1. H2 = 50 (Horizontal line separating high H2 from low H2)
    {
        start: getT4Point(null, 0, 50),
        end: getT4Point(0, null, 50)
    },

    // 2. CH4 = 15 (Separates PD/ND in high H2 region, C/S in low H2/high C2H6 region)
    {
        start: getT4Point(0, 15, null), // Right Edge
        end: getT4Point(40, 15, null)   // Intersection with C2H6=40
    },

    // 3. C2H6 = 40 (Separates high C2H6 from low C2H6 in low H2 region)
    {
        start: getT4Point(40, null, 50),
        end: getT4Point(40, null, 0)
    },

    // 4. CH4 = 65 (Separates DT from D2 in low H2, low C2H6 region)
    {
        start: getT4Point(null, 65, 0), // Bottom Edge
        end: getT4Point(0, 65, null)    // Right Edge
    }
];

const T4_LABELS: Label[] = [
    { text: 'PD', position: getT4Point(10, 20, 70) },
    { text: 'ND', position: getT4Point(10, 5, 85) },
    { text: 'S', position: getT4Point(50, 5, 45) },
    { text: 'C', position: getT4Point(50, 20, 30) },
    { text: 'DT', position: getT4Point(10, 80, 10) },
    { text: 'D2', position: getT4Point(30, 50, 20) },
];

// --- Triangle 5 Definitions ---
// Gas1: CH4 (Top), Gas2: C2H4 (Right), Gas3: C2H6 (Left)
const getT5Point = (
    c2h6: number | null,
    c2h4: number | null,
    ch4: number | null
): Point => {
    return getPointFromGases(
        ch4 !== null ? { key: 'gas1', value: ch4 } : null,
        c2h4 !== null ? { key: 'gas2', value: c2h4 } : null,
        c2h6 !== null ? { key: 'gas3', value: c2h6 } : null
    );
};

const T5_LINES: LineSegment[] = [
    // Based on standard Duval Triangle 5 (IEC 60599)
    // 1. C2H4 = 50 (Separates high C2H4 region with T2/T3 from rest)
    {
        start: getT5Point(50, 50, null), // Bottom Edge
        end: getT5Point(0, 50, null)     // Right Edge
    },

    // 2. CH4 = 20 (Separates T2 from T3 in high C2H4 region)
    {
        start: getT5Point(null, 50, 20),
        end: getT5Point(0, null, 20)
    },

    // 3. C2H6 = 60 (Separates high C2H6 region)
    {
        start: getT5Point(60, 0, null), // Left Edge
        end: getT5Point(60, null, 0)    // Bottom Edge
    },

    // 4. CH4 = 80 (Separates O from ND/C in low C2H4 region)
    {
        start: getT5Point(20, 0, null), // Left Edge
        end: getT5Point(0, null, 80)    // Right Edge
    },

    // 5. C2H6 = 23 (Separates S/C from ND in low C2H4, mid C2H6 region)
    {
        start: getT5Point(23, 0, null), // Left Edge
        end: getT5Point(23, null, 0)    // Bottom Edge
    }
];

const T5_LABELS: Label[] = [
    { text: 'PD', position: getT5Point(3, 3, 94) },
    { text: 'T2', position: getT5Point(10, 65, 25) },
    { text: 'T3', position: getT5Point(20, 70, 10) },
    { text: 'S', position: getT5Point(70, 10, 20) },
    { text: 'O', position: getT5Point(10, 5, 85) },
    { text: 'ND', position: getT5Point(40, 20, 40) },
    { text: 'C', position: getT5Point(35, 30, 35) },
];

export const DUVAL_GEOMETRY = {
    1: { lines: T1_LINES, labels: T1_LABELS },
    4: { lines: T4_LINES, labels: T4_LABELS },
    5: { lines: T5_LINES, labels: T5_LABELS }
};
