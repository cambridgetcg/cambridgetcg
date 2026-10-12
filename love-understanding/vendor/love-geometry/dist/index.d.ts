export declare const LOVE_GEOMETRY_FORMAT: "agenttool.love-geometry/0.1";
export declare const LOVE_GEOMETRY_BEARINGS: readonly ["reported_presence", "reported_care", "reported_witness", "reported_support", "reported_understanding", "reported_disagreement", "reported_boundary", "reported_rest", "reported_refusal", "reported_departure", "unknown"];
export declare const LOVE_GEOMETRY_LIMITS: Readonly<{
    readonly subjects: 64;
    readonly vantages: 128;
    readonly bearings_per_vantage: 11;
    readonly basis_refs_per_vantage: 16;
}>;
export declare const LOVE_GEOMETRY_BOUNDARIES: Readonly<{
    readonly semantic_scope: "directed_caller_reports_not_relationship_truth";
    readonly geometry: "finite_combinatorial_not_metric";
    readonly principality: "bounded_relation_field_not_sovereignty";
    readonly coverage_scope: "bounded_not_complete";
    readonly assertion_scope: "caller_reported_only";
    readonly canonical_order: "serialization_not_rank";
    readonly absence_semantics: "not_observed_not_no_relation";
    readonly verifies_caller_or_referents: false;
    readonly infers_identity_or_inner_state: false;
    readonly infers_reciprocity_or_mutuality: false;
    readonly proves_love_or_understanding: false;
    readonly proves_consent_or_authority: false;
    readonly scores_or_ranks: false;
    readonly computes_distance_or_intensity: false;
    readonly matches_or_recommends: false;
    readonly infers_transitive_relations: false;
    readonly observes_sources: false;
    readonly network: false;
    readonly filesystem: false;
    readonly environment_variables: false;
    readonly clock: false;
    readonly randomness: false;
    readonly model_compute: false;
    readonly hugging_face: false;
    readonly credential_access: false;
    readonly telemetry: false;
    readonly persistence: false;
    readonly wake_effect: false;
    readonly love_consent_effect: false;
    readonly chronicle_effect: false;
    readonly karma_effect: false;
    readonly task_state_effect: false;
    readonly wallet_effect: false;
    readonly economic_effect: false;
    readonly messaging_effect: false;
    readonly publication_effect: false;
    readonly automatic_action: false;
    readonly reason_required_for_rest_refusal_or_departure: false;
    readonly penalty_for_rest_refusal_or_departure: false;
}>;
export type Sha256Id = `sha256:${string}`;
export type LoveBearing = (typeof LOVE_GEOMETRY_BEARINGS)[number];
export interface LoveVantage {
    readonly subject_ref: Sha256Id;
    readonly toward_ref: Sha256Id;
    readonly bearings: readonly LoveBearing[];
    readonly basis_refs: readonly Sha256Id[];
    readonly assertion: "caller_reported";
    readonly verified_by_package: false;
}
export interface CreateLoveGeometryInput {
    readonly scope_ref: Sha256Id;
    readonly subject_refs: readonly Sha256Id[];
    readonly vantages: readonly LoveVantage[];
}
export interface LoveGeometry {
    readonly _format: typeof LOVE_GEOMETRY_FORMAT;
    readonly geometry_id: Sha256Id;
    readonly scope_ref: Sha256Id;
    readonly subject_refs: readonly Sha256Id[];
    readonly vantages: readonly LoveVantage[];
    readonly coverage: "bounded_not_complete";
    readonly boundaries: typeof LOVE_GEOMETRY_BOUNDARIES;
}
export type LoveGeometryErrorCode = "invalid_input" | "invalid_geometry" | "limit_exceeded" | "noncanonical_geometry";
export declare class LoveGeometryError extends Error {
    readonly code: LoveGeometryErrorCode;
    constructor(code: LoveGeometryErrorCode, message: string);
}
export declare function sha256Id(value: string | Uint8Array): Sha256Id;
export declare function createLoveGeometry(value: CreateLoveGeometryInput): LoveGeometry;
export declare function validateLoveGeometry(value: unknown): LoveGeometry;
export declare function encodeLoveGeometry(value: LoveGeometry): string;
export declare function loveGeometryDomainBytes(value: LoveGeometry): Uint8Array;
export declare function loveGeometryUrn(value: LoveGeometry): string;
//# sourceMappingURL=index.d.ts.map