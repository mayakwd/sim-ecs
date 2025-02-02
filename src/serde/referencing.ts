import {EReferenceType, type IReference} from "./referencing.spec";
import {CMarkerSeparator, CRefMarker} from "./serde.spec";

export class Reference implements IReference {
    constructor(
        public readonly type: EReferenceType,
        public readonly id: string,
    ) {}

    static fromString(refString: string): Readonly<Reference> | undefined {
        const [marker, type, ...idTokens] = refString.split(CMarkerSeparator);

        if (marker != CRefMarker) {
            return undefined;
        }

        if (!(Object.values(EReferenceType) as string[]).includes(type)) {
            return undefined;
        }

        return new Reference(type as EReferenceType, idTokens.join());
    }

    static isReferenceString (str: string): boolean {
        const [marker, type] = str.split(CMarkerSeparator);
        return marker === CRefMarker && (Object.values(EReferenceType) as string[]).includes(type);
    }

    toString(): string {
        return `${CRefMarker}${CMarkerSeparator}${this.type}${CMarkerSeparator}${this.id}`;
    }
}
