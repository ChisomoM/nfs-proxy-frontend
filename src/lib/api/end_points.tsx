export const API: Record<string, string> = {
  // ADMIN END-POINTS
  ADMIN_LOGIN: "auth/admin-login",
  LIST_MERCHANTS: "admin/merchants",
  CREATE_MERCHANT: "admin/merchants",
  GET_MERCHANT: "admin/merchants/:id",
  UPDATE_MERCHANT: "admin/merchants/:id",
  DELETE_MERCHANT: "admin/merchants/:id",
  
  // MERCHANT END-POINTS
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  REFRESH_TOKEN: "auth/refresh-token",
  ACCEPT_INVITE: "auth/merchant-invite",
  SEND_OTP: "auth/otp/send",
  VERIFY_OTP: "auth/otp/verify",

  // PROJECT END-POINTS
  LIST_PROJECTS: "merchants/apps",
  CREATE_PROJECT: "merchants/apps",
  GET_PROJECT: "merchants/apps/:id",
  UPDATE_PROJECT: "merchants/apps/:id",
  DELETE_PROJECT: "merchants/apps/:id",

  // API KEY END-POINTS (app-scoped, legacy)
  GENERATE_API_KEY: "merchants/apps/:app_id/keys",
  LIST_API_KEYS: "merchants/apps/:app_id/keys",
  REVOKE_API_KEY: "merchants/apps/:app_id/keys/:key_id",
  REQUEST_OTP_FOR_KEY: "merchants/apps/:app_id/keys/:key_id/request-otp",
  VERIFY_OTP_FOR_KEY: "merchants/apps/:app_id/keys/:key_id/verify-otp",
  TOGGLE_API_KEY: "merchants/apps/:app_id/keys/:key_id",

  // MERCHANT-LEVEL KEY END-POINTS (no app_id required)
  MERCHANT_LIST_KEYS: "merchants/keys",
  MERCHANT_GENERATE_KEY: "merchants/keys",
  MERCHANT_REVOKE_KEY: "merchants/keys/:key_id",
  MERCHANT_TOGGLE_KEY: "merchants/keys/:key_id",
  MERCHANT_REQUEST_OTP: "merchants/keys/:key_id/request-otp",
  MERCHANT_VERIFY_OTP: "merchants/keys/:key_id/verify-otp",

  // MERCHANT TRANSACTION END-POINTS
  MERCHANT_TRANSACTIONS: "merchants/transactions",

  // PARTICIPANT ENDPOINTS (admin write)
  LIST_PARTICIPANTS: "participants",
  CREATE_PARTICIPANT: "participants",
  GET_PARTICIPANT: "participants/:id",
  UPDATE_PARTICIPANT: "participants/:id",
  ARCHIVE_PARTICIPANT: "participants/:id",
  

  // APP WHITELIST ENDPOINTS (merchant)
  LIST_AVAILABLE_PARTICIPANTS: "merchants/participants",
  LIST_APP_PARTICIPANTS: "merchants/apps/:app_id/participants",
  ADD_APP_PARTICIPANT: "merchants/apps/:app_id/participants",
  REMOVE_APP_PARTICIPANT: "merchants/apps/:app_id/participants/:participant_id",

  // SIMULATOR / EMONEY END-POINTS
  SIMULATOR_EMONEY:           "api/v1/emoney",
  SIMULATOR_CASH_IN:          "api/v1/emoney/cash-in",
  SIMULATOR_CASH_OUT:         "api/v1/emoney/cash-out",
  SIMULATOR_FUND_TRANSFER:    "api/v1/emoney/person-to-person",
  SIMULATOR_NAME_LOOKUP:      "merchants/emoney/name-lookup",
  SIMULATOR_REVERSAL:         "api/v1/emoney/reversal",

  // DISBURSEMENT END-POINTS
  DISBURSEMENT_CONFIG: "api/v1/disbursements/config",
  BULK_DISBURSE:       "api/v1/disbursements/bulk",
  BULK_NAME_LOOKUP:        "merchants/emoney/name-lookup/bulk",
  BULK_NAME_LOOKUP_STATUS: "merchants/emoney/name-lookup/bulk/:batchId",
  BULK_FUND_TRANSFER:  "merchants/emoney/bulk-fund-transfer",

  // AUDIT TRAIL END-POINTS
  MERCHANT_AUDIT_TRAILS: "merchants/audit",
  MERCHANT_AUDIT_TRAIL:  "merchants/audit/:id",
  ADMIN_AUDIT_TRAILS:    "admin/audit",
  ADMIN_AUDIT_TRAIL:     "admin/audit/:id",

  // USER MANAGEMENT END-POINTS (Merchant-scoped)
  LIST_MERCHANT_USERS: "merchants/users",
  GET_MERCHANT_USER: "merchants/users/:user_id",
  INVITE_MERCHANT_USER: "merchants/users/invite",
  UPDATE_MERCHANT_USER: "merchants/users/:user_id",
  DELETE_MERCHANT_USER: "merchants/users/:user_id",
  RESEND_INVITE_MERCHANT_USER: "merchants/users/:user_id/resend-invite",
  RESET_PASSWORD_MERCHANT_USER: "merchants/users/:user_id/reset-password",

  // USER MANAGEMENT END-POINTS (Admin - System-wide)
  LIST_SYSTEM_USERS: "admin/users",
  GET_SYSTEM_USER: "admin/users/:user_id",
  INVITE_SYSTEM_USER: "admin/users/invite",
  UPDATE_SYSTEM_USER: "admin/users/:user_id",
  DELETE_SYSTEM_USER: "admin/users/:user_id",
  RESEND_INVITE_SYSTEM_USER: "admin/users/:user_id/resend-invite",
  RESET_PASSWORD_SYSTEM_USER: "admin/users/:user_id/reset-password",
};

export const getRoute = (val: string): string => {
  const uri: string | undefined | null = API[val];
  if (uri === null || uri === undefined) {
    throw new Error("key doesn't exist");
  }
  return uri;
};

export const pipe = (pattern: string, map: Record<string, string | number>) => {
  return pattern.replace(/:([^/]+)/g, (_, key: string): string => {
    if (key in map) {
      return String(map[key]);
    }
    throw new Error(`Key "${key}" not found in the map`);
  });
};
