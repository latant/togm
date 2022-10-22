import t from "./define";

const graph = t.graph({
  HAS_ARTICLE: t.relationship({
    name: t.string(),
  }),
  User: t.node({
    email: t.string(),
    roles: t.stringArrayOrNull<"USER" | "ADMIN">(),
    articles: t.manyOut("HAS_ARTICLE", "Article"),
  }),
  Article: t.node({
    title: t.string(),
    isbn: t.numberOrNull(),
    author: t.oneIn("HAS_ARTICLE", "User"),
  }),
});

const q = graph.select.Article({
  author: {
    articles: {},
  },
});

graph.select.Article({});

graph.create.Article({
  title: "",
  isbn: null,
});

graph.update.Article(0, { isbn: null });

const globalvetGraph = t.graph({
  User: t.node({
    acceptedPrivacyPolicy: t.oneOut("ACCEPTED_PRIVACY_POLICY", "AcceptedPrivacPolicy"),
    vetRegistrationNumber: t.optOut("HAS_REGISTRATION_NUMBER", "VetRegistrationNumber"),
    recoveryToken: t.optOut("HAS_RECOVERY_TOKEN", "RecoveryToken"),
    recoverySmsCode: t.optOut("HAS_RECOVERY_SMS", "RecoverySmsCode"),
    pinCode: t.optOut("HAS_PIN_CODE", "PinCode"),
    vetProfession: t.optOut("IS_VET_AS", "VetProfession"),
    pets: t.manyOut("HAS_USER_PET", "UserPet"),
    clinicRegistrations: t.manyIn("IS_REGISTERED_USER_AS", "PetOwner"),
  }),
  AcceptedPrivacPolicy: t.node({}),
  VetRegistrationNumber: t.node({}),
  RecoveryToken: t.node({}),
  RecoverySmsCode: t.node({}),
  PinCode: t.node({}),
  VetProfession: t.node({
    documents: t.manyOut("IS_PROVED_BY_DOCUMENTS", "VetProfessionDocument"),
  }),
  VetProfessionDocument: t.node({}),
  UserPet: t.node({
    owner: t.oneIn("HAS_USER_PET", "User"),
  }),
  Organization: t.node({
    owner: t.oneIn("OWNS_ORGANIZATION", "User"),
    employmentRequests: t.oneOut("ORGANIZATION_OF_EMPLOYMENT_REQUEST", "OrganizationEmploymentRequest"),
    fortnoxAccount: t.optIn("HAS_FORTNOX_ACCOUNT", "FortnoxAccount"),
    serviceContracts: t.manyOut("HAS_SERVICE_CONTRACT", "PetOwnerServiceContract"),
    stripeCustomer: t.optOut("HAS_STRIPE_CUSTOMER", "StripeCustomer"),
    paymentMethods: t.manyOut("HAS_PAYMENT_METHOD", "PaymentMethod"),
    country: t.oneOut("LOCATED_IN_COUNTRY", "Country"),
    accountingCodes: t.manyOut("HAS_ACCOUNTING_CODE", "AccountingCode"),
    addresses: t.manyOut("HAS_ADDRESS", "OrganizationAddress"),
    emails: t.manyOut("HAS_EMAIL", "OrganizationEmail"),
    phones: t.manyOut("HAS_PHONE", "OrganizationPhone"),
    giroAccounts: t.manyOut("HAS_GIRO_ACCOUNT", "GiroAccount"),
    employees: t.manyIn("EMPLOYEE_OF_ORGANIZATION", "User"),
    inventoryCategories: t.manyOut("HAS_INVENTORY_CATEGORY", "InventoryCategory"),
    clinics: t.manyIn("CLINIC_OF_ORGANIZATION", "Clinic"),
  }),
  OrganizationEmploymentRequest: t.node({
    sender: t.oneIn("SENT_ORGANIZATION_EMPLOYMENT_REQUEST", "User"),
    receiver: t.oneIn("RECEIVED_ORGANIZATION_EMPLOYMENT_REQUEST", "User"),
    organization: t.oneOut("ORGANIZATION_OF_EMPLOYMENT_REQUEST", "Organization"),
  }),
  FortnoxAccount: t.node({
    organization: t.oneIn("HAS_FORTNOX_ACCOUNT", "Organization"),
  }),
  FortnoxCustomer: t.node({
    organization: t.oneOut("FORTNOX_CUSTOMER_IN_ORGANIZATION", "Organization"),
    petOwner: t.oneIn("FORTNOX_CUSTOMER_FOR_PET_OWNER", "PetOwner"),
  }),
  PetOwnerServiceContract: t.node({
    organization: t.oneIn("HAS_SERVICE_CONTRACT", "Organization"),
    petOwnerUser: t.oneIn("ACCEPTED_SERVICE_CONTRACT", "User"),
  }),
  StripeCustomer: t.node({}),
  StripeAccount: t.node({}),
  PaymentMethod: t.node({}),
  Country: t.node({
    organizations: t.manyIn("LOCATED_IN_COUNTRY", "Organization"),
  }),
  AccountingCode: t.node({}),
  OrganizationEmail: t.node({}),
  OrganizationAddress: t.node({}),
  OrganizationPhone: t.node({}),
  GiroAccount: t.node({
    organization: t.oneIn("HAS_GIRO_ACCOUNT", "Organization"),
  }),
  EMPLOYEE_OF_ORGANIZATION: t.relationship({}),
  InventoryCategory: t.node({
    organization: t.oneIn("HAS_INVENTORY_CATEGORY", "Organization"),
    items: t.manyOut("HAS_INVENTORY_ITEMS", "InventoryItem"),
  }),
  InventoryItem: t.node({}),
  Clinic: t.node({
    organization: t.oneOut("CLINIC_OF_ORGANIZATION", "Organization"),
    affiliatedSwedishPharmacies: t.manyOut("AFFILIATED_SWEDISH_PHARMACY", "SwedishPharmacy"),
    reservationTypes: t.manyIn("RESERVATION_TYPE_IN_CLINIC", "ReservationType"),
  }),
  SwedishPharmacy: t.node({}),
  ClinicFee: t.node({
    giroAccount: t.optOut("FEE_TO_GIRO_ACCOUNT", "GiroAccount"),
  }),
  PetOwner: t.node({
    fortnoxCustomer: t.optIn("FORTNOX_CUSTOMER_FOR_PET_OWNER", "PetOwner"),
    phones: t.manyOut("HAS_PHONE", "PetOwnerPhone"),
    emails: t.manyOut("HAS_EMAIL", "PetOwnerEmail"),
    addresses: t.manyOut("HAS_ADDRESS", "PetOwnerAddress"),
    user: t.optOut("IS_REGISTERED_USER_AS", "User"),
  }),
  ReservationType: t.node({
    clinic: t.oneOut("RESERVATION_TYPE_IN_CLINIC", "ReservationType"),
  }),
  PetOwnerPhone: t.node({}),
  PetOwnerEmail: t.node({}),
  PetOwnerAddress: t.node({}),
});

const x = globalvetGraph.select.Clinic({
  organization: {
    country: {},
    clinics: {
      organization: {},
    },
  },
});

type X = typeof x;
