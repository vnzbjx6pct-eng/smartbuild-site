export enum DeliveryReasonCode {
    // A) LOGISTICS / COURIER
    COURIER_OVERLOAD = "COURIER_OVERLOAD",
    NO_COURIER_AVAILABLE = "NO_COURIER_AVAILABLE",
    TRAFFIC_DELAY = "TRAFFIC_DELAY",
    WEATHER_DELAY = "WEATHER_DELAY",

    // B) STORE / WAREHOUSE
    OUT_OF_STOCK = "OUT_OF_STOCK",
    PARTIAL_STOCK = "PARTIAL_STOCK",
    WAREHOUSE_DELAY = "WAREHOUSE_DELAY",
    PICKING_DELAY = "PICKING_DELAY",
    STORE_CONFIRMATION_DELAY = "STORE_CONFIRMATION_DELAY",

    // C) ADDRESS / CUSTOMER
    ADDRESS_CLARIFICATION_REQUIRED = "ADDRESS_CLARIFICATION_REQUIRED",
    PHONE_UNREACHABLE = "PHONE_UNREACHABLE",
    CUSTOMER_REQUESTED_RESCHEDULE = "CUSTOMER_REQUESTED_RESCHEDULE",
    CUSTOMER_CANCELLED = "CUSTOMER_CANCELLED",

    // D) SYSTEM
    PROVIDER_ERROR = "PROVIDER_ERROR",
    PAYMENT_ISSUE = "PAYMENT_ISSUE",
    UNKNOWN = "UNKNOWN"
}

export const REASON_PRIORITIES: Record<DeliveryReasonCode, number> = {
    [DeliveryReasonCode.OUT_OF_STOCK]: 1,
    [DeliveryReasonCode.PARTIAL_STOCK]: 1,

    [DeliveryReasonCode.ADDRESS_CLARIFICATION_REQUIRED]: 2,
    [DeliveryReasonCode.PHONE_UNREACHABLE]: 2,

    [DeliveryReasonCode.NO_COURIER_AVAILABLE]: 3,
    [DeliveryReasonCode.COURIER_OVERLOAD]: 3,

    [DeliveryReasonCode.WEATHER_DELAY]: 4,
    [DeliveryReasonCode.TRAFFIC_DELAY]: 4,

    [DeliveryReasonCode.WAREHOUSE_DELAY]: 5,
    [DeliveryReasonCode.PICKING_DELAY]: 5,
    [DeliveryReasonCode.STORE_CONFIRMATION_DELAY]: 5,

    [DeliveryReasonCode.PROVIDER_ERROR]: 6,
    [DeliveryReasonCode.PAYMENT_ISSUE]: 6,

    [DeliveryReasonCode.CUSTOMER_REQUESTED_RESCHEDULE]: 7,
    [DeliveryReasonCode.CUSTOMER_CANCELLED]: 7,
    [DeliveryReasonCode.UNKNOWN]: 7
};


export enum DeliverySeverity {
    INFO = "info",
    ACTION_REQUIRED = "action_required",
    WARNING = "warning",
    ERROR = "error",
    SUCCESS = "success" // for delivered
}

export enum DeliveryAction {
    NONE = "none",
    FIX_ADDRESS = "fix_address",
    CONFIRM_PHONE = "confirm_phone",
    PAY_AGAIN = "pay_again",
    RESOLVE_STOCK = "resolve_stock",
    RETRY_PROVIDER = "retry_provider",
    CONTACT_SUPPORT = "contact_support"
}

export const REASON_SEVERITY: Record<DeliveryReasonCode, DeliverySeverity> = {
    [DeliveryReasonCode.COURIER_OVERLOAD]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.NO_COURIER_AVAILABLE]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.TRAFFIC_DELAY]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.WEATHER_DELAY]: DeliverySeverity.INFO, // Can escalate to warning in logic

    [DeliveryReasonCode.OUT_OF_STOCK]: DeliverySeverity.ACTION_REQUIRED,
    [DeliveryReasonCode.PARTIAL_STOCK]: DeliverySeverity.ACTION_REQUIRED,
    [DeliveryReasonCode.WAREHOUSE_DELAY]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.PICKING_DELAY]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.STORE_CONFIRMATION_DELAY]: DeliverySeverity.WARNING,

    [DeliveryReasonCode.ADDRESS_CLARIFICATION_REQUIRED]: DeliverySeverity.ACTION_REQUIRED,
    [DeliveryReasonCode.PHONE_UNREACHABLE]: DeliverySeverity.ACTION_REQUIRED,
    [DeliveryReasonCode.CUSTOMER_REQUESTED_RESCHEDULE]: DeliverySeverity.INFO,
    [DeliveryReasonCode.CUSTOMER_CANCELLED]: DeliverySeverity.INFO,

    [DeliveryReasonCode.PROVIDER_ERROR]: DeliverySeverity.WARNING,
    [DeliveryReasonCode.PAYMENT_ISSUE]: DeliverySeverity.ACTION_REQUIRED,
    [DeliveryReasonCode.UNKNOWN]: DeliverySeverity.WARNING
};

export const REASON_ACTION: Record<DeliveryReasonCode, DeliveryAction> = {
    [DeliveryReasonCode.ADDRESS_CLARIFICATION_REQUIRED]: DeliveryAction.FIX_ADDRESS,
    [DeliveryReasonCode.PHONE_UNREACHABLE]: DeliveryAction.CONFIRM_PHONE,
    [DeliveryReasonCode.PAYMENT_ISSUE]: DeliveryAction.PAY_AGAIN,
    [DeliveryReasonCode.OUT_OF_STOCK]: DeliveryAction.RESOLVE_STOCK,
    [DeliveryReasonCode.PARTIAL_STOCK]: DeliveryAction.RESOLVE_STOCK,
    [DeliveryReasonCode.PROVIDER_ERROR]: DeliveryAction.RETRY_PROVIDER,

    // Others default to NONE
    [DeliveryReasonCode.COURIER_OVERLOAD]: DeliveryAction.NONE,
    [DeliveryReasonCode.NO_COURIER_AVAILABLE]: DeliveryAction.NONE,
    [DeliveryReasonCode.TRAFFIC_DELAY]: DeliveryAction.NONE,
    [DeliveryReasonCode.WEATHER_DELAY]: DeliveryAction.NONE,
    [DeliveryReasonCode.WAREHOUSE_DELAY]: DeliveryAction.NONE,
    [DeliveryReasonCode.PICKING_DELAY]: DeliveryAction.NONE,
    [DeliveryReasonCode.STORE_CONFIRMATION_DELAY]: DeliveryAction.NONE,
    [DeliveryReasonCode.CUSTOMER_REQUESTED_RESCHEDULE]: DeliveryAction.NONE,
    [DeliveryReasonCode.CUSTOMER_CANCELLED]: DeliveryAction.NONE,
    [DeliveryReasonCode.UNKNOWN]: DeliveryAction.NONE
};

