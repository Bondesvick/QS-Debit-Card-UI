export class AdditionalAcctPayload {
    accountName:string;
    existingAccount: string;
    existingAccountType: string;
    phoneNumber: string;
    newAccountType: string;
    extraAccountClass: string;
    currency: string;
    authType: string;
    documents: UploadedDocument[];
    otpIdentifier: string;
    otpSourceReference:string;
    otp: string;
    otpReasonCode: string;
    preferredNameOnDebitCard: string;
    pickUpBranchForDebitCard: string;
    firstRefereeName: string;
    firstRefereeBank: string;
    firstRefereeAccountNumber: string;
    secondRefereeName: string;
    secondRefereeBank: string;
    secondRefereeAccountNumber: string;
    employmentStatus: string;
    occupation: string;
    natureOfBusiness: string;
    incomeRange: string;
    nameOfEmployer: string;
    levelOfEducation: string;
    nameOfInstitution: string;
    requestedDebitCard: boolean;
    idType: string;
    idNumber: string;
    caseId: string;
    currentStep: string;
    submitted: boolean;
}

export class DebitCardPayload {
  phoneNumber: string;
  authType: string;
  otpSourceReference: string;
  otp: string;
  otpIdentifier: string;
  otpReasonCode: string;
  accountName: string;
  accountNumber: string;
  bvn: string;
  iAcceptTermsAndCondition: true;
  expiryDate: string;
  dateOfAcceptingTAndC: string;
  dateOfBirth: string;
  requestType: string;
  nameOnCard: string;
  //cardType: string;
  branch: string;
  //city: string;
//   gender: string;
//   title: string;
//   maritalStatus: string;
  accountToDebit: string;
  hotlistedCard: string;
  accountStatus: string;
  caseId: string;
  currentStep: string;
  submitted: boolean
  hotlistCode: string
}

export class UploadedDocument {
    title: string;
    name: string;
    base64Content: string;
    documentExt?:string;
}

export class ContinueSession {
    caseId: string;
    accountNumber: string;
}

export class CardRadioOption {
    name: string;
    value: boolean;
}

export class IdVerificationRequest {
    idType: string;
    idNumber: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
}
export class TinVerificationRequest {
    tinNumber: string;
    accountName: string;
}

export class AccountEnquiryRequest {
    accountNumber: string;
}
