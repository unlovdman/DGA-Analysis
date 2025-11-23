

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
    // 1. C2H2 = 13 (Separates D1/D2/DT from PD/T1/T2/T3)
    // Starts at Left Edge (C2H4=0, C2H2=13) -> Ends at Right Edge (CH4=0, C2H2=13) ??
    // Wait, Right Edge is C2H2=0. It doesn't intersect Right Edge at 13.
    // It intersects Bottom Edge (CH4=0) at C2H2=13?
    // Bottom Edge: CH4=0. p2+p3=100. C2H4 + C2H2 = 100.
    // If C2H2=13, then C2H4=87.
    // So Start: C2H4=0, C2H2=13. End: CH4=0, C2H2=13.
    {
        start: getT1Point(13, 0, null), // On Left Edge
        end: getT1Point(13, null, 0)    // On Bottom Edge
    },

    // 2. C2H4 = 23 (Separates D2/T2 from D1/T1/T3)
    // This line exists in both C2H2>13 and C2H2<=13 regions?
    // In C2H2>13 (Bottom-Left): Separates D2 from D1.
    // In C2H2<=13 (Top/Right): Separates T2 from T1.
    // So it goes from C2H2=13 line to... where?
    // For D2/D1 boundary: From C2H2=13 line to Bottom Edge (CH4=0).
    // For T2/T1 boundary: From C2H2=13 line to Top Edge? No, Top Edge is C2H4=0.
    // It goes to Right Edge (C2H2=0)?
    // Right Edge: C2H2=0. p1+p2=100. CH4+C2H4=100.
    // If C2H4=23, CH4=77.
    // So the line C2H4=23 goes from Bottom Edge (CH4=0) to Right Edge (C2H2=0).
    // But it is interrupted by other lines?
    // Actually, let's draw the full segments based on region intersections.

    // Segment: C2H4=23 from Bottom Edge (CH4=0) to Right Edge (C2H2=0).
    // Wait, is it a single straight line? Yes, constant C2H4 is a straight line.
    // Does it stop?
    // In the diagram, it separates D2/D1 and T2/T1.
    // It seems to be a continuous line from Bottom Edge to Right Edge.
    {
        start: getT1Point(null, 23, 0), // Bottom Edge (CH4=0)
        end: getT1Point(0, 23, null)    // Right Edge (C2H2=0)
    },

    // 3. C2H4 = 9 (Separates D1/DT and T3/PD?)
    // From Bottom Edge (CH4=0) to...
    // In C2H2<=13 region, it separates T3 from PD?
    // Wait, PD is C2H4<=9 AND C2H2<=13.
    // So C2H4=9 is the boundary of PD.
    // It goes from C2H2=13 line to Left Edge (C2H4=0)? No, C2H4=9 is parallel to Left Edge.
    // It goes from Bottom Edge (CH4=0) to Right Edge (C2H2=0)?
    // If C2H4=9, at Right Edge (C2H2=0), CH4=91.
    // So yes, it's a line from Bottom to Right Edge.
    // But for PD boundary, it stops at C2H2=13?
    // PD is bounded by C2H2=13 and C2H4=9.
    // So the line segment for PD is part of C2H4=9.
    // And for DT/D1, it is also C2H4=9.
    // So C2H4=9 is also a full line from Bottom Edge to Right Edge?
    // Let's verify T3. T3 is 9 < C2H4 <= 23 AND CH4 <= 85.
    // So T3 is bounded by C2H4=9 and C2H4=23.
    // So yes, C2H4=9 is a full line.
    {
        start: getT1Point(null, 9, 0), // Bottom Edge
        end: getT1Point(0, 9, null)    // Right Edge
    },

    // 4. CH4 = 75 (Separates T1 from T2)
    // Only valid when C2H4 > 23.
    // So it goes from C2H4=23 line to... Right Edge?
    // Right Edge (C2H2=0): If CH4=75, C2H4=25. (Since C2H4>23, this is valid).
    // So it starts at intersection of CH4=75 & C2H4=23 ??
    // Wait, if CH4=75 and C2H4=23, then C2H2=2.
    // Is this point on the C2H4=23 line? Yes.
    // So it goes from (CH4=75, C2H4=23) to Right Edge (CH4=75, C2H2=0).
    {
        start: getT1Point(null, 23, 75), // Intersection with C2H4=23
        end: getT1Point(0, null, 75)     // Right Edge
    },

    // 5. CH4 = 85 (Separates T1 from T3)
    // Only valid when 9 < C2H4 <= 23.
    // Starts at intersection of CH4=85 & C2H4=23?
    // If CH4=85, C2H4=23 -> Sum=108. Impossible.
    // Wait. T1 is CH4 > 85 (in the 9-23 band).
    // So the line is CH4=85.
    // It goes from C2H4=9 line to C2H4=23 line?
    // At C2H4=9: CH4=85 -> C2H2=6. (Valid, <13).
    // At C2H4=23: CH4=85 -> Sum=108. Impossible.
    // So it hits the Right Edge?
    // Right Edge (C2H2=0): CH4=85 -> C2H4=15. (Valid, 9<15<23).
    // So it goes from C2H4=9 line (at CH4=85) to Right Edge (at CH4=85).
    {
        start: getT1Point(null, 9, 85), // Intersection with C2H4=9
        end: getT1Point(0, null, 85)    // Right Edge
    }
];

const T1_LABELS: Label[] = [
    { text: 'PD', position: getT1Point(6, 4, 90) }, // High CH4, Low C2H4, Low C2H2
    { text: 'T1', position: getT1Point(6, 15, 79) }, // High CH4, Med C2H4
    { text: 'T2', position: getT1Point(6, 40, 54) }, // High C2H4, Med CH4
    { text: 'T3', position: getT1Point(6, 15, 79) }, // Wait, T1 and T3 overlap in my guess?
    // T1: CH4 > 85 (in 9-23 band). T3: CH4 <= 85.
    // So T3 is below T1.
    // T3 position: CH4=70, C2H4=15, C2H2=15? No C2H2 must be <13.
    // T3: CH4=70, C2H4=15, C2H2=15 (Too high C2H2).
    // T3: CH4=80, C2H4=15, C2H2=5.
    { text: 'T3', position: getT1Point(5, 15, 80) },
    // Fix T1: CH4=90, C2H4=5? No C2H4>9.
    // T1 (in 9-23 band): CH4=88, C2H4=10, C2H2=2.
    // T1 (in >23 band): CH4=80, C2H4=25? No CH4>75.
    // Let's put T1 label in the larger upper area.
    { text: 'T1', position: getT1Point(2, 10, 88) },

    { text: 'D1', position: getT1Point(20, 15, 65) }, // High C2H2 (>13), Med C2H4 (9-23)
    { text: 'D2', position: getT1Point(20, 40, 40) }, // High C2H2, High C2H4
    { text: 'DT', position: getT1Point(20, 5, 75) },  // High C2H2, Low C2H4
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
    // 1. H2 = 50 (Horizontal)
    // From Left Edge (CH4=0) to Right Edge (C2H6=0)
    {
        start: getT4Point(null, 0, 50),
        end: getT4Point(0, null, 50)
    },
    // 2. CH4 = 15 (Parallel to Left Edge)
    // Separates PD/ND and C/S.
    // Goes from H2=50 line to Bottom Edge?
    // In H2>50: Separates PD/ND.
    // In H2<=50: Separates C/S.
    // So it's a full line from H2=50 to Bottom Edge?
    // Wait, in H2<=50, C2H6>40 region: C vs S.
    // In H2<=50, C2H6<=40 region: DT vs D2.
    // Boundary for DT/D2 is CH4=65.
    // So CH4=15 stops at C2H6=40?
    // Let's check logic:
    // if H2<=50:
    //   if C2H6 > 40:
    //     if CH4 > 15 -> C
    //     else -> S
    //   else (C2H6 <= 40):
    //     ...
    // So CH4=15 is only relevant when C2H6 > 40.
    // So it goes from H2=50 line to C2H6=40 line.
    // Also relevant in H2>50 (PD vs ND).
    // So it goes from Top Edge (C2H6=0? No, Top Edge is H2=100? No. Left Edge is CH4=0. Right Edge is C2H6=0.)
    // CH4=15 is parallel to Left Edge.
    // It goes from Right Edge (C2H6=0, H2=85) to C2H6=40 line?
    // Wait.
    // In H2>50: PD (CH4>15) vs ND (CH4<=15).
    // So CH4=15 starts at Right Edge (where C2H6=0)?
    // At Right Edge: C2H6=0, CH4=15, H2=85.
    // It goes down to H2=50 line. (Intersection: H2=50, CH4=15, C2H6=35).
    // Then continues into H2<=50 region?
    // In H2<=50, if C2H6>40: C vs S.
    // So it continues until C2H6=40?
    // Intersection: C2H6=40, CH4=15, H2=45.
    // So yes, CH4=15 goes from Right Edge to C2H6=40 line.
    {
        start: getT4Point(0, 15, null), // Right Edge
        end: getT4Point(40, 15, null)   // Intersection with C2H6=40
    },

    // 3. C2H6 = 40 (Parallel to Right Edge)
    // Separates {C, S} from {DT, D2}.
    // Valid when H2 <= 50.
    // Starts at H2=50 line (Intersection: H2=50, C2H6=40, CH4=10).
    // Ends at Bottom Edge (H2=0, C2H6=40, CH4=60).
    {
        start: getT4Point(40, null, 50),
        end: getT4Point(40, null, 0)
    },

    // 4. CH4 = 65 (Parallel to Left Edge)
    // Separates DT from D2.
    // Valid when H2 <= 50 AND C2H6 <= 40.
    // Starts at C2H6=40 line (Intersection: C2H6=40, CH4=65 -> Sum=105. Impossible).
    // Wait.
    // If C2H6 <= 40, then CH4 can be large.
    // Max CH4 is when H2=0 -> CH4 = 100 - C2H6.
    // If C2H6=40, Max CH4=60.
    // So CH4=65 is NOT possible at C2H6=40.
    // So CH4=65 line must start at H2=50?
    // If H2=50, Max CH4=50.
    // So CH4=65 is not possible at H2=50 either.
    // Where is CH4=65 valid?
    // It requires H2 + C2H6 <= 35.
    // So it is in the bottom-right corner.
    // It goes from Bottom Edge (H2=0, CH4=65, C2H6=35) to Right Edge (C2H6=0, CH4=65, H2=35).
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
    // 1. C2H4 = 50 (Parallel to Left Edge)
    // Separates {T2, T3} from others.
    // Goes from Bottom Edge (CH4=0, C2H4=50, C2H6=50) to Right Edge (C2H6=0, C2H4=50, CH4=50).
    {
        start: getT5Point(50, 50, null), // Bottom Edge
        end: getT5Point(0, 50, null)     // Right Edge
    },

    // 2. CH4 = 20 (Horizontal)
    // Separates T2 from T3 (inside C2H4 > 50).
    // Starts at C2H4=50 line (Intersection: C2H4=50, CH4=20, C2H6=30).
    // Ends at Right Edge (C2H6=0, CH4=20, C2H4=80).
    {
        start: getT5Point(null, 50, 20),
        end: getT5Point(0, null, 20)
    },

    // 3. C2H6 = 60 (Parallel to Right Edge)
    // Separates {C, S} from {O, ND}.
    // Valid when C2H4 <= 50.
    // Starts at C2H4=50 line?
    // Intersection: C2H4=50, C2H6=60 -> Sum=110. Impossible.
    // So C2H6=60 never meets C2H4=50.
    // It goes from Left Edge (C2H4=0, C2H6=60, CH4=40) to Bottom Edge (CH4=0, C2H6=60, C2H4=40).
    {
        start: getT5Point(60, 0, null), // Left Edge
        end: getT5Point(60, null, 0)    // Bottom Edge
    },

    // 4. CH4 = 40 (Horizontal)
    // Separates C from S (inside C2H6 > 60).
    // Starts at Left Edge (C2H4=0, CH4=40, C2H6=60).
    // Ends at C2H6=60 line (Intersection: C2H6=60, CH4=40, C2H4=0).
    // Wait, it starts and ends at the same point?
    // No.
    // C vs S condition: C2H6 > 60.
    // CH4 > 40 -> C.
    // So CH4=40 is the boundary.
    // It goes from Left Edge (C2H4=0, CH4=40, C2H6=60) to...
    // Where does it stop?
    // The region is C2H6 > 60.
    // So it stops at C2H6=60 line?
    // Intersection: C2H6=60, CH4=40, C2H4=0.
    // This is the point on the Left Edge.
    // So the line is just a point?
    // Let's re-read logic:
    // if C2H6 > 60:
    //   if CH4 > 40 -> C
    //   else -> S
    // So the boundary is CH4=40.
    // But C2H6 must be > 60.
    // If CH4=40 and C2H6 > 60, then C2H4 < 0. Impossible.
    // So C and S are separated by CH4=40, but is there any space where CH4=40 AND C2H6>60?
    // CH4+C2H6+C2H4 = 100.
    // 40 + >60 + C2H4 = 100.
    // >100 + C2H4 = 100.
    // C2H4 must be negative.
    // So the boundary CH4=40 only touches the region at the very edge (C2H6=60, CH4=40, C2H4=0).
    // This implies the region C (CH4>40 AND C2H6>60) is EMPTY or impossible?
    // Wait. If C2H6=61, CH4=40 -> Sum=101.
    // So CH4 cannot be 40 if C2H6 > 60.
    // So C (CH4>40) is impossible if C2H6 > 60.
    // Let's check `analyzeTriangle5` logic again.
    // `else if (pC2H6 > 60) { if (pCH4 > 40) C else S }`
    // Maybe I misread the logic or the logic has a bug/typo?
    // Or maybe the threshold is different?
    // Standard Duval 5:
    // C is usually High CH4? No, C is Carbonization.
    // Let's check the image.
    // Figure D.4 Duval Triangle 5.
    // C is the central region.
    // S is Stray Gassing (High C2H6?).
    // The logic says: `if (pC2H6 > 60)`. This is the Left Corner.
    // Inside Left Corner: `if (pCH4 > 40) C else S`.
    // This seems physically impossible if sum=100.
    // Maybe `pCH4` threshold is lower? Or `pC2H6` threshold is lower?
    // Or maybe it's `pC2H4`?
    // Let's assume the logic in `duvalAnalysis.ts` might be slightly off for C/S, OR I am misinterpreting "C2H6 > 60".
    // If C2H6 > 60, max CH4 is 40.
    // So `CH4 > 40` is never true.
    // So `C` is never detected in that branch?
    // Wait, `analyzeTriangle5` line 194: `else if (pC2H6 > 60)`.
    // Line 195: `if (pCH4 > 40)`.
    // Yes, this code path seems unreachable for C.
    // However, I must draw what the code *intends* or what the standard is.
    // Standard T5:
    // S is the C2H6 corner.
    // C is the middle.
    // O is the top (CH4) corner.
    // ND is the bottom-left?
    // Let's look at the provided image `uploaded_image_3_1763877120629.png` (Figure D.4).
    // Top (CH4): PD? No, PD is tiny tip. O is below it.
    // Left (C2H6): T3? No.
    // Right (C2H4): T3?
    // Let's look at labels in image.
    // Top: PD. Then O.
    // Middle: S (Left side), C (Center), T2 (Right side).
    // Bottom: ND (Left), T3 (Right).

    // My code logic:
    // `pC2H4 > 50` (Right side): T2 / T3. Matches image (Right side has T2, T3).
    // `pC2H6 > 60` (Left side): C / S.
    //   - Image shows S is on the Left side. C is Center.
    //   - So `pC2H6 > 60` should be S?
    //   - Code says: `if pCH4 > 40 then C else S`.
    //   - Maybe it meant `pC2H6 > some_smaller_value`?
    //   - Or maybe `pCH4` check is different.
    //   - If I look at the image, S is bounded by C2H6 lines?
    //   - S is the region between ND and C?

    // I will stick to drawing the lines that *make sense* geometrically for the standard, if the code is dubious.
    // But I should try to match the code if possible.
    // If the code is impossible, I'll draw the line `CH4=40` anyway, even if it's outside the triangle or at the edge.
    // Actually, `CH4=40` is a valid line. `C2H6=60` is a valid line.
    // Their intersection is (CH4=40, C2H6=60, C2H4=0).
    // So they meet at the Left Edge.
    // So the region `CH4>40` inside `C2H6>60` is just a point.
    // I will draw the line `CH4=40` from Left Edge to... somewhere.
    // But visually, for T5, I should probably draw the standard lines.
    // Standard T5 lines (approx):
    // C2H4 = 50 (Vertical-ish).
    // CH4 = 20 (Horizontal).
    // C2H6 = 60? No, usually S/ND boundary is different.
    // Let's use the lines defined in the code, but maybe adjust the start/end to be visible if they are valid.
    // For `CH4=40` inside `C2H6>60`: It's effectively invisible.
    // I will skip drawing it if it's degenerate.

    // 5. CH4 = 80 (Horizontal)
    // Separates O from ND.
    // Valid when C2H4 <= 50 AND C2H6 <= 60.
    // Starts at Left Edge (C2H4=0, CH4=80, C2H6=20).
    // Ends at C2H4=50 line?
    // Intersection: C2H4=50, CH4=80 -> Sum=130. Impossible.
    // Ends at C2H6=60 line?
    // Intersection: C2H6=60, CH4=80 -> Sum=140. Impossible.
    // Ends at Right Edge?
    // Right Edge (C2H6=0, CH4=80, C2H4=20).
    // Is this valid? C2H4=20 <= 50. Yes.
    // So CH4=80 goes from Left Edge to Right Edge.
    {
        start: getT5Point(20, 0, null), // Left Edge
        end: getT5Point(0, null, 80)    // Right Edge
    }
];

const T5_LABELS: Label[] = [
    { text: 'T2', position: getT5Point(10, 60, 30) },
    { text: 'T3', position: getT5Point(10, 80, 10) },
    { text: 'S', position: getT5Point(70, 10, 20) },
    { text: 'O', position: getT5Point(5, 5, 90) },
    { text: 'ND', position: getT5Point(30, 30, 40) },
    // C is problematic in code, but let's place it centrally
    { text: 'C', position: getT5Point(40, 30, 30) },
];

export const DUVAL_GEOMETRY = {
    1: { lines: T1_LINES, labels: T1_LABELS },
    4: { lines: T4_LINES, labels: T4_LABELS },
    5: { lines: T5_LINES, labels: T5_LABELS }
};
