import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { AccountValidation } from 'src/app/core/models/payloads/account-validation';
import { ContinueSession, DebitCardPayload } from 'src/app/core/models/payloads/additional-acct-payload';
import { TermsOfUseComponent } from '../terms-of-use/terms-of-use.component';
import {DebitCardService} from '../../core/services/debit-card.service'
import { BVNValidationRequest, GetActiveCardRequest } from 'src/app/core/models/acct-upgrade-request';
import { OTPPayload } from 'src/app/core/models/payloads/otp-payload';

@Component({
  selector: 'app-debit-card',
  templateUrl: './debit-card.component.html',
  styleUrls: ['./debit-card.component.css', '../../app.component.css']
})
export class DebitCardComponent implements OnInit {

  dialogBoxSettings = {
    margin: '0 auto',
    disableClose: true,
    hasBackdrop: true,
    data: {}
  };
  isAccountStepperActive: boolean = true;
  isAccountStepperDone: boolean = false;
  isContinueSessionStepperActive: boolean = false;
  isContinueSessionStepperDone: boolean = false;
  isCardInformationActive: boolean = false;
  isCardInformaitonDone: boolean = false;
  isTermandconditionActive: boolean = false;
  isTermandconditionDone: boolean = false;
  isSummaryPageActive: boolean= false;
  isSummaryPageDone :boolean  = false;
  isAuthenticationFormActive = false;
  isAuthenticationFormDone= false;



  isAwaitingResponse: boolean = false;
  maskedPAN: string;
  expiryDate: string;
  haveActiveCard : boolean= false;

  accountFormGroup: FormGroup;
  continueSessionForm: FormGroup;
  cardInformaitonForm: FormGroup;
  otpForm: FormGroup;

  public hotlistModalRef: MatDialogRef<any>;
  @ViewChild('hotListModalTemplate', { static: true }) hotListModalTemplate: TemplateRef<any>;

  showSpinner: boolean = false;
  acctDetails: any;
  color = 'primary';
  mode = 'indeterminate'as const;
  value = 50;
  bufferValue = 75;
  ticketID: any;
  caseId: string = '';
  class = '';
  hotlistCodes = [{code: '01', reason: 'Refer to card issuer'},
                  {code: '36', reason: 'Restrict and Retract Card'},
                  {code: '41', reason: 'Lost Card'},
                  {code: '43', reason: 'Stolen Card'},
                  {code: '56', reason: 'Card not Found'},
                  {code: '62', reason: 'Stale Card'},
                  ]
  titles = [{
      "customerTitleCode": "Mr"},
    {"customerTitleCode": "MRS"},
    {"customerTitleCode": "MS"},
    {"customerTitleCode": "Prof"},
    {"customerTitleCode": "Dr"},
    {"customerTitleCode": "Evang"},
    {"customerTitleCode": "Chief"},
    {"customerTitleCode": "Admiral"},
    {"customerTitleCode": "Senator"}
  ]

  gender = [
    "M",
    "F"
  ]

  maritalStaus = [
    {
      "maritalStatus": "Single"
    },
    {
      "maritalStatus": "Married"
    },
    {
      "maritalStatus": "Reserved"
    },
    {
      "maritalStatus": "Divorced"
    },
    {
      "maritalStatus": "Widow"
    },
    {
      "maritalStatus": "Cohabit"
    }
  ]

  branches = [];
  cityState = [];
  cities = [];
  states = [];
  bvnForm: FormGroup;
  isTermAndCond1Checked: boolean;
  otpReference: any;
  hotListForm: FormGroup;
  mystepper: MatStepper;

  cardTypes: any[];


  constructor(private dialog: MatDialog, private formBuilder: FormBuilder, private _snackBar: MatSnackBar, private debitCardService: DebitCardService ) { }
  
  ngOnInit(): void {
    this.openTermsOfUse();

    this.accountFormGroup = this.formBuilder.group({
      phoneNoCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      accountNoCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]]
    });

    this.continueSessionForm = this.formBuilder.group({
      caseId: ['']
    });

    this.bvnForm = this.formBuilder.group({
      bvnCtrl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]],
      dateOfBirthCtrl: ['', Validators.required]
    });

    this.otpForm = this.formBuilder.group({
      otpControl: ['', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]]
    });

    this.hotListForm = this.formBuilder.group({
      hotlistcodeCtrl: ['', Validators.required]
    });

    this.cardInformaitonForm = this.formBuilder.group({
      nameOnCardCtrl: ['',[Validators.required, Validators.maxLength(21)] ],
      //cardType: ['', Validators.required],
      branchCtrl: ['', Validators.required],
      //stateCtrl: ['', Validators.required],
      //cityCtrl: ['', Validators.required],
      // titleCtrl: ['', Validators.required],
      // genderCtrl: ['', Validators.required],
      // maritalStatusCtrl: ['', Validators.required],
    });

    this.getBranches();
    //this.getCities();

  }

  navigateToQuickServiceHome() {
  const quickServiceHomeURL = 'https://ibanking.stanbicibtcbank.com/quickservices'
    window.open(quickServiceHomeURL, '_self');
    window.focus();
  }

  get nameOnCard() { return this.cardInformaitonForm.controls.nameOnCardCtrl.value; }
  get branch() { return this.cardInformaitonForm.controls.branchCtrl.value; }


  openTermsOfUse(): void {
    const dialogRef = this.dialog.open(
      TermsOfUseComponent,
      this.dialogBoxSettings
    );
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openHotlisting(): void {
    this.hotlistModalRef = this.dialog.open(this.hotListModalTemplate, {
      width: '500px',
      height: '400px',
      disableClose: true
    });

    this.hotlistModalRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }

  concertTohotlist(){
    this.dialog.closeAll();
    this.isCardInformationActive = true;
    this.isContinueSessionStepperDone = true;
    this.isContinueSessionStepperActive = false;
    this.mystepper.next()
  }

  proceedFromAccountForm(stepper: MatStepper) {
    const payload = this.buildAcctValidation();

    this.showSpinner = true;
    this.isAwaitingResponse = true;

    this.debitCardService.validateAccountNoAndPhoneNo(payload).subscribe(
      (response: { responseCode: string; data: { bvn: any; }; responseDescription: any; }) => {

        // Invalid Phone number match - RETURN
        if (response.responseCode === '01') {
          this.showSpinner = false;
          this.isAwaitingResponse = false;
          this._snackBar.open(response.responseDescription, 'Error',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
          return;
        }

        

        // Successful API call
        if (response.responseCode === '00' || response.responseCode === '03') {
          this.showSpinner = false;
          this.isAwaitingResponse = false;
          this.acctDetails = response.data;
          console.log('acc val data', response.data);

         
          // Handle next corporate - SET ACCOUNT TYPE
          if (this.acctDetails.accountSegment.includes('BUSINESS BANKING')){
            this._snackBar.open('This is only applicable to personal account holders', 'Error',
              { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });

          }

          if (response.responseCode === '03'){
            this.haveActiveCard = true
          }
           // Success
           this._snackBar.open(`Account has been validated for ${this.acctDetails.firstName} ${this.acctDetails.lastName}`, 'Ok',
           { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });

          
          // Move to next stepper
          this.isAccountStepperActive = false;
          this.isAccountStepperDone = true;
          this.isContinueSessionStepperActive = true;
          stepper.next();
        }
        else {
          //Failed
          this.showSpinner = false;
          this.isAwaitingResponse = false;
          this._snackBar.open(response.responseDescription, 'Error',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
        }
      },
      (      error: any) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        this._snackBar.open('Error occured', 'Ok',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      }
    );
    //stepper.next();
  }

  ValidateBvn(stepper: MatStepper){
    this.isAwaitingResponse = true;
    this.showSpinner = true;

    const payload: BVNValidationRequest = {
      firstName: this.acctDetails.firstName,
      lastName: this.acctDetails.lastName,
      dateOfbirth: this.bvnForm.controls.dateOfBirthCtrl.value,
      accountNumber: this.accountFormGroup.controls.accountNoCtrl.value,
      bvnId: this.bvnForm.controls.bvnCtrl.value
    }

    console.log(this.bvnForm.controls.dateOfBirthCtrl.value)
    console.log(new Date(this.bvnForm.controls.dateOfBirthCtrl.value))

    this.debitCardService.validateBvn(payload).subscribe(res => {
      console.log(res);
      this.isAwaitingResponse = false;
      this.showSpinner = false;
      if (res.responseCode == '00') {

        this._snackBar.open('BVN has been successfully validated', 'Ok',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });

          //this.GetActiveCard(stepper)
          this.GetCardType(stepper)
          
      }
      else {
        this._snackBar.open(res.responseDescription, 'Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
      }

    }, error => {
      this.isAwaitingResponse = false;
      this._snackBar.open('An error ocurred while trying to validate BVN', 'Error',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
    });
    //stepper.next()
  }

  GetCardType(stepper: MatStepper){
    this.isAwaitingResponse = true;
    this.showSpinner = true
    const payload: GetActiveCardRequest = {
      accountNumber: this.accountFormGroup.controls.accountNoCtrl.value,
    }

    this.debitCardService.getCardType(payload).subscribe(res => {
      console.log(res);
      this.isAwaitingResponse = false;
      this.showSpinner = false;
      if (res.responseCode === "00") {

        console.log(res.data.cardProgram);
        this.cardTypes = res.data.cardProgram;
        
        this.isCardInformationActive = true;
        this.isContinueSessionStepperDone = true;
        this.isContinueSessionStepperActive = false;
        stepper.next()
      }
      else if (res.responseCode === "01") {
        this.isAwaitingResponse = false;
        this.showSpinner = false;
        this._snackBar.open(res.responseDescription, 'OK',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
        this.GetActiveCard(stepper);
      }
      else {
        this._snackBar.open(res.responseDescription, 'OK',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
      }

    }, error => {
      this.isAwaitingResponse = false;
      this.showSpinner = false;
      this._snackBar.open('An technical error occurred!', 'Error',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
    });
  }

  GetActiveCard(stepper: MatStepper){
    this.isAwaitingResponse = true;
    this.showSpinner = true
    const payload: GetActiveCardRequest = {
      accountNumber: this.accountFormGroup.controls.accountNoCtrl.value,
    }

    this.debitCardService.getActiveCard(payload).subscribe(res => {
      console.log(res);
      this.isAwaitingResponse = false;
      this.showSpinner = false;
      if (res.responseCode != '00') {
        this.haveActiveCard = false
        // this._snackBar.open('BVN has been successfully validated', 'Ok',
        //   { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
          this.isCardInformationActive = true;
          this.isContinueSessionStepperDone = true;
          this.isContinueSessionStepperActive = false;

          this._snackBar.open(res.responseDescription, 'OK',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
          //stepper.next()
      }
      else {
        this.haveActiveCard = true
        this.maskedPAN = res.data.maskedPAN
        this.expiryDate = res.data.expiryDate
        this.mystepper = stepper
        this.openHotlisting();
      }

    }, error => {
      this.isAwaitingResponse = false;
      this.showSpinner = false;
      this._snackBar.open('An error ocurred while trying to validate BVN', 'Error',
        { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
    });
  }

  checked(value){
    this.isTermAndCond1Checked = value;
      console.log(this.isTermAndCond1Checked);
    }


  proceedFromTermsCondition(stepper: MatStepper){
    this.isTermandconditionActive = false;
    this.isTermandconditionDone = true;
    this.isSummaryPageActive = true
    stepper.next();
  }
  proceedToTermsPageStepper(stepper: MatStepper){
    this.isCardInformationActive = false;
    this.isCardInformaitonDone = true;
    this.isTermandconditionActive = true
    stepper.next();
  }

  proceedFromSummary(stepper: MatStepper){
    // if (this.acctDetails.availableBalance < 1075){
    //   this._snackBar.open('account not funded for transaction', 'Error',
    //     { verticalPosition: 'top', horizontalPosition: 'center', duration: 10000 });
    // }
    // else{
    //   this.initiateCorporateAcctOTP(stepper)
    // }
    this.initiateCorporateAcctOTP(stepper)
  }

  initiateCorporateAcctOTP(stepper) {
    this.showSpinner = true;
    this.isAwaitingResponse = true;
    const payload = this.buildOTPPayload();
    this.debitCardService.initiateOTP(payload).subscribe(
      (response) => {
        console.log(response);
        if (response.responseCode === '00') {
          this.showSpinner = false;
          this.isAwaitingResponse = false;
          this.otpReference = response.responseDescription;
          if (this.acctDetails.maskedPhoneNumber) {
            this._snackBar.open(`OTP has been sent to ${this.acctDetails.maskedPhoneNumber}`, 'Ok',
              { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
          } else {
            this._snackBar.open(`OTP has been sent to your registered phone number`, 'Ok',
              { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
          }
          this.isSummaryPageActive = false;
          this.isSummaryPageDone = true;
          this.isCardInformationActive = true;
          stepper.next();
        } else {
          this.showSpinner = false;
          this.isAwaitingResponse = false;
          this._snackBar.open('Error Occured', 'Error',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
        }
      },
      error => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        this._snackBar.open('Error occured', 'Ok',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      });
  }

  resendOTP() {
    this.showSpinner = true;
    const payload = this.buildOTPPayload();
    this.debitCardService.initiateOTP(payload).subscribe(
      (response) => {
        if (response.responseCode === '00') {
          this.showSpinner = false;
          this.otpReference = response.responseDescription;
          this._snackBar.open(`OTP has been sent to your registered phone number`, 'Ok',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
        } else {
          this.showSpinner = false;
          this._snackBar.open('Error Occured', 'Error',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
        }
      },
      error => {
        this.showSpinner = false;
        this._snackBar.open('Error occured', 'Ok',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      });
  }

  submitRequest(stepper: MatStepper) {
    const payload = this.buildDataUpdatePayload(this.caseId, 'COMPLETED');

    console.log(payload);

    this.showSpinner = true;
    this.isAwaitingResponse = true;
    this.debitCardService.submitRequest(payload).subscribe(
      (response) => {
        this.showSpinner = false;
        this.isAwaitingResponse = false;
        console.log(response);
        if (response.responseCode === '00') {
          
            this.isAuthenticationFormActive = false;
            this.isAuthenticationFormDone = true;
            

          this.ticketID = response.data.detail;
          this._snackBar.open(response.responseDescription, 'Ok',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
          stepper.next();
        } else {
          this._snackBar.open(response.responseDescription, 'Ok',
            { verticalPosition: 'top', horizontalPosition: 'center', duration: 15000 });
        }
      },
      (err) => {
        this.showSpinner = false
        this.isAwaitingResponse = false;
        console.log(err);
        this._snackBar.open('Error occured', 'Ok',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000 });
      });
  }

  buildOTPPayload(): OTPPayload {
    return {
      cifId: this.acctDetails.cifId,
      userId: this.accountFormGroup.controls.accountNoCtrl.value,
      reasonCode: '20',
      reasonDescription: 'INITIATE OTP DEBIT CARD'
    };
  }

  disagreeTC(stepper: MatStepper) {
    this.dialog.closeAll();
  }
 
  //#region SESSION
  proceedWithoutSession(stepper: MatStepper) {
    this.isContinueSessionStepperActive = false;
    this.isContinueSessionStepperDone = true;
    stepper.next();
  }

  getBranches() {
    this.debitCardService.GetBranch().subscribe(
      (resp) => {
        this.branches = resp
        console.log(resp)
      },
      (err) => {
        this._snackBar.open('Error occured', ' Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['successSnackbar'] });
      });

  }

  getCities() {
    this.debitCardService.getCityState().subscribe(
      (resp) => {
        //this.cities = resp
        this.cityState = resp;
        this.states = resp.map(x => x.region);
        this.states = [...new Set(this.states)];
        console.log(this.states);
        console.log(resp)
      },
      (err) => {
        this._snackBar.open('Error occured', ' Error',
          { verticalPosition: 'top', horizontalPosition: 'center', duration: 5000, panelClass: ['successSnackbar'] });
      });

  }

  changeState(state: string){
    this.cities = this.cityState.filter(x => x.region == state);
    this.cardInformaitonForm.controls.cityCtrl.setValue(null);
  }

  buildDataUpdatePayload(caseId: string, currentStep: string, submitted: boolean = false): DebitCardPayload {
    const hcode = this.hotListForm.controls.hotlistcodeCtrl.value != null && this.hotListForm.controls.hotlistcodeCtrl.value != ""? 
    this.hotListForm.controls.hotlistcodeCtrl.value.code: null
    return { 
      accountName: `${this.acctDetails.firstName} ${this.acctDetails.lastName}`,
      authType: 'signature',
      otp: this.otpForm.controls.otpControl.value,
      otpReasonCode: '20',
      otpSourceReference: this.otpReference,
      accountNumber: this.accountFormGroup.controls.accountNoCtrl.value,
      bvn: this.bvnForm.controls.bvnCtrl.value,
      hotlistCode: hcode,
      iAcceptTermsAndCondition: true,
      dateOfBirth: this.bvnForm.controls.dateOfBirthCtrl.value,
      requestType: this.haveActiveCard? "renew card": "new card",
      nameOnCard: this.cardInformaitonForm.controls.nameOnCardCtrl.value,
      //cardType : this.cardInformaitonForm.controls.cardType.value,
      branch: this.cardInformaitonForm.controls.branchCtrl.value.sol_Id,
      //city: this.cardInformaitonForm.controls.cityCtrl.value.city,
      // title: this.cardInformaitonForm.controls.titleCtrl.value.customerTitleCode,
      // gender: this.cardInformaitonForm.controls.genderCtrl.value,
      // maritalStatus: this.cardInformaitonForm.controls.maritalStatusCtrl.value.maritalStatus,
      accountToDebit: this.accountFormGroup.controls.accountNoCtrl.value,
      hotlistedCard: this.maskedPAN,
      expiryDate: this.expiryDate,
      accountStatus: 'Active',
      currentStep: '',
      caseId: caseId,
      dateOfAcceptingTAndC: Date.now.toString(),
      submitted: submitted,
      phoneNumber: this.accountFormGroup.controls.phoneNoCtrl.value,
      otpIdentifier:this.accountFormGroup.controls.accountNoCtrl.value
    };

   
  }

  // onYesClick(stepper: MatStepper) {
  //   this.showSpinner = true;

  //   this.caseId = this.continueSessionForm.controls.caseId.value;

  //   const payload: ContinueSession = {
  //     caseId: this.caseId,
  //     accountNumber: this.accountFormGroup.controls.accountNoCtrl.value
  //   }

  //   this.debitCardService.continueSession(payload).subscribe(res => {
  //     this.showSpinner = false;

  //     if (res.responseCode === '00') {
  //       this.continueSession(res.data.detail, stepper);
  //       this.isContinueSessionStepperActive = false;
  //       this.isContinueSessionStepperDone = true;
  //     }
  //     else {
  //       this.caseId = undefined;
  //       this._snackBar.open(`${res.responseDescription} Click on 'GET STARTED' to continue`, 'Ok',
  //         { verticalPosition: 'top', horizontalPosition: 'center', duration: 20000 });
  //       return
  //     }
  //   });

  // }
  


  buildAcctValidation(): AccountValidation {
    return {
      accountNumber: this.accountFormGroup.controls.accountNoCtrl.value,
      phoneNumber: this.accountFormGroup.controls.phoneNoCtrl.value
    }
  }

}


