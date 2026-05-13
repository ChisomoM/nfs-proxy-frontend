export const API: Record<string, string> = {
  // ADMIN END-POINTS
  ADMIN_LOGIN: "auth/admin-login",
  LIST_MERCHANTS: "api/v1/admin/merchants",
  CREATE_MERCHANT: "api/v1/admin/merchants",
  GET_MERCHANT: "api/v1/admin/merchants/:id",
  UPDATE_MERCHANT: "api/v1/admin/merchants/:id",
  DELETE_MERCHANT: "api/v1/admin/merchants/:id",
  
  // MERCHANT END-POINTS
  LOGIN: "auth/login",
  REGISTER: "auth/register",
  REFRESH_TOKEN: "auth/refresh-token",
  ACCEPT_INVITE: "auth/merchant-invite",
  SEND_OTP: "auth/otp/send",
  VERIFY_OTP: "auth/otp/verify",

  // PROJECT END-POINTS
  LIST_PROJECTS: "api/v1/merchants/apps",
  CREATE_PROJECT: "api/v1/merchants/apps",
  GET_PROJECT: "api/v1/merchants/apps/:id",
  UPDATE_PROJECT: "api/v1/merchants/apps/:id",
  DELETE_PROJECT: "api/v1/merchants/apps/:id",

  // API KEY END-POINTS (app-scoped, legacy)
  GENERATE_API_KEY: "api/v1/merchants/apps/:app_id/keys",
  LIST_API_KEYS: "api/v1/merchants/apps/:app_id/keys",
  REVOKE_API_KEY: "api/v1/merchants/apps/:app_id/keys/:key_id",
  REQUEST_OTP_FOR_KEY: "api/v1/merchants/apps/:app_id/keys/:key_id/request-otp",
  VERIFY_OTP_FOR_KEY: "api/v1/merchants/apps/:app_id/keys/:key_id/verify-otp",
  TOGGLE_API_KEY: "api/v1/merchants/apps/:app_id/keys/:key_id",

  // MERCHANT-LEVEL KEY END-POINTS (no app_id required)
  MERCHANT_LIST_KEYS: "api/v1/merchants/keys",
  MERCHANT_GENERATE_KEY: "api/v1/merchants/keys",
  MERCHANT_REVOKE_KEY: "api/v1/merchants/keys/:key_id",
  MERCHANT_TOGGLE_KEY: "api/v1/merchants/keys/:key_id",
  MERCHANT_REQUEST_OTP: "api/v1/merchants/keys/:key_id/request-otp",
  MERCHANT_VERIFY_OTP: "api/v1/merchants/keys/:key_id/verify-otp",

  // PARTICIPANT ENDPOINTS (admin write)
  LIST_PARTICIPANTS: "participants",
  CREATE_PARTICIPANT: "participants",
  GET_PARTICIPANT: "participants/:id",
  UPDATE_PARTICIPANT: "participants/:id",
  ARCHIVE_PARTICIPANT: "participants/:id",
  

  // APP WHITELIST ENDPOINTS (merchant)
  LIST_AVAILABLE_PARTICIPANTS: "api/v1/merchants/participants",
  LIST_APP_PARTICIPANTS: "api/v1/merchants/apps/:app_id/participants",
  ADD_APP_PARTICIPANT: "api/v1/merchants/apps/:app_id/participants",
  REMOVE_APP_PARTICIPANT: "api/v1/merchants/apps/:app_id/participants/:participant_id",

  // SIMULATOR / EMONEY END-POINTS
  SIMULATOR_EMONEY:           "api/v1/emoney",
  SIMULATOR_CASH_IN:          "api/v1/emoney/cash-in",
  SIMULATOR_CASH_OUT:         "api/v1/emoney/cash-out",
  SIMULATOR_FUND_TRANSFER:    "api/v1/emoney/person-to-person",
  SIMULATOR_NAME_LOOKUP:      "api/v1/emoney/name-lookup",
  SIMULATOR_REVERSAL:         "api/v1/emoney/reversal",

  // DISBURSEMENT END-POINTS
  DISBURSEMENT_CONFIG: "api/v1/disbursements/config",
  BULK_DISBURSE:       "api/v1/disbursements/bulk",
  BULK_NAME_LOOKUP:    "api/v1/emoney/name-lookup/bulk",

  // AUDIT TRAIL END-POINTS
  MERCHANT_AUDIT_TRAILS: "api/v1/merchants/audit",
  MERCHANT_AUDIT_TRAIL:  "api/v1/merchants/audit/:id",
  ADMIN_AUDIT_TRAILS:    "api/v1/admin/audit",
  ADMIN_AUDIT_TRAIL:     "api/v1/admin/audit/:id",
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
