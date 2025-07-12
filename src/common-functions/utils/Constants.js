export const STATUS_RECEIVED = 'RECEIVED'
export const STATUS_PARTLY_RECEIVED = 'PARTLY_RECEIVED'
export const STATUS_PAID = 'PAID'
export const STATUS_PARTLY_PAID = 'PARTLY_PAID'
export const STATUS_SENT = 'SENT'
export const STATUS_CONFIRMED = 'CONFIRMED'
export const STATUS_SHIPPED = 'SHIPPED'
export const STATUS_PARTLY_SHIPPED = 'PARTLY_SHIPPED'
export const STATUS_DELIVERED = 'DELIVERED'
export const STATUS_PARTLY_DELIVERED = 'PARTLY_DELIVERED'
export const STATUS_DRAFT = 'DRAFT'
export const STATUS_PENDING = 'PENDING'
export const STATUS_PARTLY_CLEARED = 'PARTLY_CLEARED'
export const STATUS_CLEARED = 'CLEARED'
export const STATUS_CUSTOM_CLEARED = 'CUSTOM_CLEARED'
export const STATUS_CLEAR_TO_RECEIVE = 'CLEAR_TO_RECEIVE'
export const STATUS_AWAITING_RECONCILIATION = 'AWAITING_RECONCILIATION'
export const STATUS_PENDING_CLEARANCE = 'PENDING_CLEARANCE'
export const STATUS_EXPIRED = 'expired'
export const STATUS_ACTIVE = 'active'
export const STATUS_NEW = 'NEW'
export const STATUS_PACKED = 'PACKED'
export const STATUS_PARTLY_FULFILLED = 'PARTLY_FULFILLED'
export const STATUS_FULFILLED = 'FULFILLED'
export const BANK_PAYMENT_TYPE = 'BANK'
export const STATUS_INVOICED = 'INVOICED'
export const STATUS_ISSUED = 'ISSUED'
export const SALES_INVOICE = 'SALES_INVOICE'
export const SALES_INVOICE_PAYMENT = 'SALES_INVOICE_PAYMENT'
export const STATUS_COMPLETE = 'COMPLETE'

export const SalesPayment_Statuses = [
  STATUS_PENDING,
  STATUS_CLEARED,
  STATUS_PENDING_CLEARANCE,
  STATUS_AWAITING_RECONCILIATION
]
export const Quotation_Statuses = [STATUS_DRAFT, STATUS_SENT, STATUS_CONFIRMED]
export const PriceList_Statuses = [STATUS_ACTIVE, STATUS_EXPIRED]
export const SEND_EMAIL_QUEUE = 'send-email-queue'
export const SALES_ORDER_EMAIL_TYPE = 'SALES_ORDER'
export const SCHEMA_VERSION = '1.0'
export const DATE_FORMAT = 'DD/MM/YYYY'

//view vendor tabs
export const OVERVIEW = 'overview'
export const TRANSACTIONS = 'transactions'
export const NOTES = 'notes'

//S3 PDF Folder Name
export const SALES_INVOICE_PAYMENT_PDF = 'salesInvoicePaymentPdf'
export const GENERAL_EXPENSE = 'generalExpensePdf'
export const VENDOR_PDF = 'vendorPdf'
export const PURCHASE_PACKAGE_PDF = 'purchaseOrderPackagePdf'
export const PURCHASE_PAYMENT_PDF = 'purchasePyamentPdf'
export const PURCHASE_ORDER_PDF = 'purchaseOrderPdf'
export const PURCHASE_SHIPMENT_PDF = 'purchaseShipmentPdf'
export const CUSTOMER_PDF = 'customerPdf'
export const PACKAGES_PDF = 'packagesPdf'
export const QUOTATION_PDF = 'quotaionPdf'
export const SALES_ORDER_PDF = 'salesOrderPdf'
export const SALES_INVOICE_PDF = 'salesInvoicePdf'
export const EXPENSE_PDF = 'expensePdf'
export const TAX_STATEMENT_PDF = 'taxStatementPdf'
export const TAX_AUTHORITY_PDF = 'taxAuthorityPdf'
export const TAX_PAYMENT_PDF = 'taxPaymentPdf'

//Bank Transaction Constant
export const BANK_TRANSACTION_SO_PAYMENT = 'SALES_INVOICE_PAYMENT'
export const BANK_TRANSACTION_PO_PAYMENT = 'PURCHASE_ORDER_PAYMENT'
export const BANK_TRANSACTION_EXPENSE_TYPE = 'EXPENSE_PAYMENT'
export const BANK_TRANSACTION_ACCOUNT_TRANSACTION = 'ACCOUNT_TRANSACTION'

//for dynamic component
export const TAXES = 'taxes'

//Sales Order Permissions
export const CREATE_SALES_ORDER = 'create-sales-order'
export const LIST_SALES_ORDER = 'list-sales-order'
export const EDIT_SALES_ORDER = 'edit-sales-order'
export const VIEW_SALES_ORDER = 'view-sales-order'
export const DELETE_SALES_ORDER = 'delete-sales-order'
export const MANAGE_SALES_ORDER = 'manage-sales-order'

//Sales INVOICE Permissions
export const CREATE_SALES_INVOICE = 'create-sales-invoice'
export const LIST_SALES_INVOICE = 'list-sales-invoice'
export const EDIT_SALES_INVOICE = 'edit-sales-invoice'
export const VIEW_SALES_INVOICE = 'view-sales-invoice'
export const DELETE_SALES_INVOICE = 'delete-sales-invoice'
export const MANAGE_SALES_INVOICE = 'manage-sales-invoice'

// Customer Permissions
export const CREATE_CUSTOMER = 'create-customer'
export const LIST_CUSTOMER = 'list-customer'
export const EDIT_CUSTOMER = 'edit-customer'
export const VIEW_CUSTOMER = 'view-customer'
export const DELETE_CUSTOMER = 'delete-customer'

// Quotations Permissions
export const CREATE_QUOTATION = 'create-quotation'
export const LIST_QUOTATION = 'list-quotation'
export const EDIT_QUOTATION = 'edit-quotation'
export const VIEW_QUOTATION = 'view-quotation'
export const DELETE_QUOTATION = 'delete-quotation'

// Packages Permissions
export const CREATE_PACKAGE = 'create-package'
export const LIST_PACKAGE = 'list-package'
export const EDIT_PACKAGE = 'edit-package'
export const VIEW_PACKAGE = 'view-package'
export const DELETE_PACKAGE = 'delete-package'

// Sales Payment Permissions
export const CREATE_SALES_PAYMENT = 'create-sales-payment'
export const LIST_SALES_PAYMENT = 'list-sales-payment'
export const EDIT_SALES_PAYMENT = 'edit-sales-payment'
export const VIEW_SALES_PAYMENT = 'view-sales-payment'
export const DELETE_SALES_PAYMENT = 'delete-sales-payment'

// Purchase Order (PO) Permissions
export const CREATE_PURCHASE_ORDER = 'create-purchase-order'
export const LIST_PURCHASE_ORDER = 'list-purchase-order'
export const EDIT_PURCHASE_ORDER = 'edit-purchase-order'
export const VIEW_PURCHASE_ORDER = 'view-purchase-order'
export const DELETE_PURCHASE_ORDER = 'delete-purchase-order'
export const MANAGE_PURCHASE_ORDER = 'manage-purchase-order'

// Vendor Permissions
export const CREATE_VENDOR = 'create-vendor'
export const LIST_VENDOR = 'list-vendor'
export const EDIT_VENDOR = 'edit-vendor'
export const VIEW_VENDOR = 'view-vendor'
export const DELETE_VENDOR = 'delete-vendor'

// Purchase Package  Permissions
export const CREATE_PURCHASE_PACKAGE = 'create-purchase-package'
export const LIST_PURCHASE_PACKAGE = 'list-purchase-package'
export const EDIT_PURCHASE_PACKAGE = 'edit-purchase-package'
export const VIEW_PURCHASE_PACKAGE = 'view-purchase-package'
export const DELETE_PURCHASE_PACKAGE = 'delete-purchase-package'

// Purchase Shipments (PS) Permissions
export const CREATE_PURCHASE_SHIPMENT = 'create-purchase-shipment'
export const LIST_PURCHASE_SHIPMENT = 'list-purchase-shipment'
export const EDIT_PURCHASE_SHIPMENT = 'edit-purchase-shipment'
export const VIEW_PURCHASE_SHIPMENT = 'view-purchase-shipment'
export const DELETE_PURCHASE_SHIPMENT = 'delete-purchase-shipment'

// Purchase Payment (PP) Permissions
export const CREATE_PURCHASE_PAYMENT = 'create-purchase-payment'
export const LIST_PURCHASE_PAYMENT = 'list-purchase-payment'
export const EDIT_PURCHASE_PAYMENT = 'edit-purchase-payment'
export const VIEW_PURCHASE_PAYMENT = 'view-purchase-payment'
export const DELETE_PURCHASE_PAYMENT = 'delete-purchase-payment'
export const MANAGE_PURCHASE_PAYMENT = 'manage-purchase-payment'

// Products Permissions
export const CREATE_ITEM = 'create-item'
export const LIST_ITEM = 'list-item'
export const EDIT_ITEM = 'edit-item'
export const VIEW_ITEM = 'view-item'
export const DELETE_ITEM = 'delete-item'

//stock adjust permissions
export const LIST_STOCK = 'list-stock'
export const CREATE_STOCK = 'create-stock'
export const EDIT_STOCK = 'edit-stock'
export const VIEW_STOCK = 'view-stock'
export const DELETE_STOCK = 'delete-stock'
export const MANAGE_STOCK = 'manage-stock'

// Price List Permissions
export const CREATE_PRICE_LIST = 'create-price-list'
export const LIST_PRICE_LIST = 'list-price-list'
export const EDIT_PRICE_LIST = 'edit-price-list'
export const VIEW_PRICE_LIST = 'view-price-list'
export const DELETE_PRICE_LIST = 'delete-price-list'

// Account List Permissions
export const CREATE_ACCOUNT = 'create-account'
export const LIST_ACCOUNT = 'list-account'
export const EDIT_ACCOUNT = 'edit-account'
export const VIEW_ACCOUNT = 'view-account'
export const DELETE_ACCOUNT = 'delete-account'

// Account Entry Permissions
export const CREATE_ACCOUNT_ENTRY = 'create-account-entry'
export const LIST_ACCOUNT_ENTRY = 'list-account-entry'
export const VIEW_ACCOUNT_ENTRY = 'view-account-entry'
export const DELETE_ACCOUNT_ENTRY = 'delete-account-entry'

// Bank Transaction Permissions
export const CREATE_BANK_TRANSACTION = 'create-bank-transaction'
export const LIST_BANK_TRANSACTION = 'list-bank-transaction'
export const EDIT_BANK_TRANSACTION = 'edit-bank-transaction'
export const VIEW_BANK_TRANSACTION = 'view-bank-transaction'
export const DELETE_BANK_TRANSACTION = 'delete-bank-transaction'
export const MANAGE_BANK_TRANSACTION = 'manage-bank-transaction'

// Expense Permissions
export const CREATE_EXPENSE = 'create-expense'
export const LIST_EXPENSE = 'list-expense'
export const EDIT_EXPENSE = 'edit-expense'
export const VIEW_EXPENSE = 'view-expense'
export const DELETE_EXPENSE = 'delete-expense'

// Authorities Permissions
export const CREATE_TAX_AUTHORITIES = 'create-tax-authorities'
export const LIST_TAX_AUTHORITIES = 'list-tax-authorities'
export const EDIT_TAX_AUTHORITIES = 'edit-tax-authorities'
export const VIEW_TAX_AUTHORITIES = 'view-tax-authorities'
export const DELETE_TAX_AUTHORITIES = 'delete-tax-authorities'

// Statement Permissions
export const CREATE_STATEMENT = 'create-statement'
export const LIST_STATEMENT = 'list-statement'
export const EDIT_STATEMENT = 'edit-statement'
export const VIEW_STATEMENT = 'view-statement'
export const DELETE_STATEMENT = 'delete-statement'
export const MANAGE_STATEMENT = 'manage-statement'

// Tax Payment Permissions
export const CREATE_TAX_PAYMENT = 'create-tax-payment'
export const LIST_TAX_PAYMENT = 'list-tax-payment'
export const EDIT_TAX_PAYMENT = 'edit-tax-payment'
export const VIEW_TAX_PAYMENT = 'view-tax-payment'
export const DELETE_TAX_PAYMENT = 'delete-tax-payment'

// Reports Permissions
export const LIST_PROFIT_LOSS = 'list-profit-loss'
export const LIST_BALANCE_SHEET = 'list-balance-sheet'

// Account Settings Permissions
export const LIST_ACCOUNT_SETTING = 'list-account-setting'
export const EDIT_ACCOUNT_SETTING = 'edit-account-setting'

// User Permissions
export const CREATE_USER = 'create-user'
export const LIST_USER = 'list-user'
export const EDIT_USER = 'edit-user'
export const VIEW_USER = 'view-user'
export const DELETE_USER = 'delete-user'

// Tenant Permissions
export const CREATE_TENANT = 'create-tenant'
export const LIST_TENANT = 'list-tenant'
export const EDIT_TENANT = 'edit-tenant'
export const VIEW_TENANT = 'view-tenant'
export const DELETE_TENANT = 'delete-tenant'

// Trading Permissions
export const CREATE_TRADING = 'create-trading'
export const LIST_TRADING = 'list-trading'
export const EDIT_TRADING = 'edit-trading'
export const VIEW_TRADING = 'view-trading'
export const DELETE_TRADING = 'delete-trading'

// Warehouse Permissions
export const CREATE_WAREHOUSE = 'create-warehouse'
export const LIST_WAREHOUSE = 'list-warehouse'
export const EDIT_WAREHOUSE = 'edit-warehouse'
export const VIEW_WAREHOUSE = 'view-warehouse'
export const DELETE_WAREHOUSE = 'delete-warehouse'

// Sales Setting Permissions
export const LIST_SALES_SETTING = 'list-sales-setting'
export const EDIT_SALES_SETTING = 'edit-sales-setting'

// Purchase Setting Permissions
export const LIST_PURCHASE_SETTING = 'list-purchase-setting'
export const CREATE_PURCHASE_SETTING = 'create-purchase-setting'
export const EDIT_PURCHASE_SETTING = 'edit-purchase-setting'
export const VIEW_PURCHASE_SETTING = 'view-purchase-setting'

// Tax Setting Permissions
export const LIST_TAX_SETTING = 'list-tax-setting'
export const EDIT_TAX_SETTING = 'edit-tax-setting'

// Other Setting Permissions
export const LIST_OTHER_SETTING = 'list-other-setting'
export const EDIT_OTHER_SETTING = 'edit-other-setting'
export const PaymentTypes = ['PAYMENT']
