/** Tables mirrored from FinUp SQLite backup / cloud sync payload. */
export const FINUP_TABLES = [
    'accounts',
    'categories',
    'transactions',
    'people',
    'ledger',
    'rules',
    'budgets',
    'goals',
    'tags',
    'txn_tags',
    'receipts',
    'deleted_refs',
] as const;

export type FinupTableName = (typeof FINUP_TABLES)[number];
