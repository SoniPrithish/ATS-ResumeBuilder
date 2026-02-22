/**
 * @module types/common
 * @description Shared utility types used across the entire application.
 */

/**
 * Generic result wrapper for service layer responses.
 * Enables consistent error handling without exceptions.
 */
export type ServiceResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: string };

/**
 * Paginated result for list endpoints.
 */
export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}

/** Cache configuration for service layer caching */
export interface CacheConfig {
    /** Cache key prefix */
    prefix: string;
    /** TTL in seconds */
    ttl: number;
    /** Whether caching is enabled for this operation */
    enabled: boolean;
}

/** Subscription tiers */
export type SubscriptionTier = "free" | "pro" | "enterprise";

/** Sort direction */
export type SortDirection = "asc" | "desc";

/** Common filter options for list queries */
export interface ListFilters {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: SortDirection;
    search?: string;
}

/** Timestamp fields present on most database records */
export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

/** File upload metadata */
export interface FileUploadMeta {
    fileName: string;
    fileType: string;
    fileSize: number;
    key: string;
    url: string;
}
