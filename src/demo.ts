import { def } from "./togm";

const globalvetGraph = def.graph({
  User: def.node({
    acceptedPrivacyPolicy: def.oneOut("ACCEPTED_PRIVACY_POLICY", "AcceptedPrivacPolicy"),
    vetRegistrationNumber: def.optOut("HAS_REGISTRATION_NUMBER", "VetRegistrationNumber"),
    recoveryToken: def.optOut("HAS_RECOVERY_TOKEN", "RecoveryToken"),
    recoverySmsCode: def.optOut("HAS_RECOVERY_SMS", "RecoverySmsCode"),
    pinCode: def.optOut("HAS_PIN_CODE", "PinCode"),
    vetProfession: def.optOut("IS_VET_AS", "VetProfession"),
    pets: def.manyOut("HAS_USER_PET", "UserPet"),
    clinicRegistrations: def.manyIn("IS_REGISTERED_USER_AS", "PetOwner"),
  }),
  AcceptedPrivacPolicy: def.node({}),
  VetRegistrationNumber: def.node({}),
  RecoveryToken: def.node({}),
  RecoverySmsCode: def.node({}),
  PinCode: def.node({}),
  VetProfession: def.node({
    documents: def.manyOut("IS_PROVED_BY_DOCUMENTS", "VetProfessionDocument"),
  }),
  VetProfessionDocument: def.node({}),
  UserPet: def.node({
    owner: def.oneIn("HAS_USER_PET", "User"),
  }),
  Organization: def.node({
    owner: def.oneIn("OWNS_ORGANIZATION", "User"),
    employmentRequests: def.oneOut("ORGANIZATION_OF_EMPLOYMENT_REQUEST", "OrganizationEmploymentRequest"),
    fortnoxAccount: def.optIn("HAS_FORTNOX_ACCOUNT", "FortnoxAccount"),
    serviceContracts: def.manyOut("HAS_SERVICE_CONTRACT", "PetOwnerServiceContract"),
    stripeCustomer: def.optOut("HAS_STRIPE_CUSTOMER", "StripeCustomer"),
    paymentMethods: def.manyOut("HAS_PAYMENT_METHOD", "PaymentMethod"),
    country: def.oneOut("LOCATED_IN_COUNTRY", "Country"),
    accountingCodes: def.manyOut("HAS_ACCOUNTING_CODE", "AccountingCode"),
    addresses: def.manyOut("HAS_ADDRESS", "OrganizationAddress"),
    emails: def.manyOut("HAS_EMAIL", "OrganizationEmail"),
    phones: def.manyOut("HAS_PHONE", "OrganizationPhone"),
    giroAccounts: def.manyOut("HAS_GIRO_ACCOUNT", "GiroAccount"),
    employees: def.manyIn("EMPLOYEE_OF_ORGANIZATION", "User"),
    inventoryCategories: def.manyOut("HAS_INVENTORY_CATEGORY", "InventoryCategory"),
    clinics: def.manyIn("CLINIC_OF_ORGANIZATION", "Clinic"),
  }),
  OrganizationEmploymentRequest: def.node({
    sender: def.oneIn("SENT_ORGANIZATION_EMPLOYMENT_REQUEST", "User"),
    receiver: def.oneIn("RECEIVED_ORGANIZATION_EMPLOYMENT_REQUEST", "User"),
    organization: def.oneOut("ORGANIZATION_OF_EMPLOYMENT_REQUEST", "Organization"),
  }),
  FortnoxAccount: def.node({
    organization: def.oneIn("HAS_FORTNOX_ACCOUNT", "Organization"),
  }),
  FortnoxCustomer: def.node({
    organization: def.oneOut("FORTNOX_CUSTOMER_IN_ORGANIZATION", "Organization"),
    petOwner: def.oneIn("FORTNOX_CUSTOMER_FOR_PET_OWNER", "PetOwner"),
  }),
  PetOwnerServiceContract: def.node({
    organization: def.oneIn("HAS_SERVICE_CONTRACT", "Organization"),
    petOwnerUser: def.oneIn("ACCEPTED_SERVICE_CONTRACT", "User"),
  }),
  StripeCustomer: def.node({}),
  StripeAccount: def.node({}),
  PaymentMethod: def.node({}),
  Country: def.node({
    organizations: def.manyIn("LOCATED_IN_COUNTRY", "Organization"),
  }),
  AccountingCode: def.node({}),
  OrganizationEmail: def.node({}),
  OrganizationAddress: def.node({}),
  OrganizationPhone: def.node({}),
  GiroAccount: def.node({
    organization: def.oneIn("HAS_GIRO_ACCOUNT", "Organization"),
  }),
  EMPLOYEE_OF_ORGANIZATION: def.relationship({}),
  InventoryCategory: def.node({
    organization: def.oneIn("HAS_INVENTORY_CATEGORY", "Organization"),
    items: def.manyOut("HAS_INVENTORY_ITEMS", "InventoryItem"),
  }),
  InventoryItem: def.node({}),
  Clinic: def.node({
    organization: def.oneOut("CLINIC_OF_ORGANIZATION", "Organization"),
    affiliatedSwedishPharmacies: def.manyOut("AFFILIATED_SWEDISH_PHARMACY", "SwedishPharmacy"),
    reservationTypes: def.manyIn("RESERVATION_TYPE_IN_CLINIC", "ReservationType"),
  }),
  SwedishPharmacy: def.node({}),
  ClinicFee: def.node({
    giroAccount: def.optOut("FEE_TO_GIRO_ACCOUNT", "GiroAccount"),
  }),
  PetOwner: def.node({
    fortnoxCustomer: def.optIn("FORTNOX_CUSTOMER_FOR_PET_OWNER", "PetOwner"),
    phones: def.manyOut("HAS_PHONE", "PetOwnerPhone"),
    emails: def.manyOut("HAS_EMAIL", "PetOwnerEmail"),
    addresses: def.manyOut("HAS_ADDRESS", "PetOwnerAddress"),
    user: def.optOut("IS_REGISTERED_USER_AS", "User"),
  }),
  ReservationType: def.node({
    clinic: def.oneOut("RESERVATION_TYPE_IN_CLINIC", "ReservationType"),
  }),
  PetOwnerPhone: def.node({}),
  PetOwnerEmail: def.node({}),
  PetOwnerAddress: def.node({}),
});

async function main() {
  const selectClinic = globalvetGraph.select.Clinic({
    organization: {
      country: {},
      clinics: {
        organization: {},
      },
    },
  });
  const c = await selectClinic.findOne({
    $id: 3,
    $not: {
      $any: {
        $not: {
          $any: {},
        },
      },
    },
  });
  c?.organization.country.$rid;
}
