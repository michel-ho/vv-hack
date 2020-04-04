import {AfterContentChecked, Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {MatStepper} from '@angular/material';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {KurzArbeitVoranmeldung} from '../../../api/kurzArbeitVoranmeldung';
import {Kanton} from '../../../api/kanton';
import {Costumer} from '../../../api/Costumer';
import {Api} from '../../../api/api';
import {HttpClient} from '@angular/common/http';
import {MessageViewComponent} from '../message-view/message-view.component';
import {MAT_STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';

@Component({
  selector: 'app-anfrage-progress',
  templateUrl: './anfrage-progress.component.html',
  styleUrls: ['./anfrage-progress.component.scss'],
  providers: [{
    provide: MAT_STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class AnfrageProgressComponent implements OnInit, AfterContentChecked {

  @ViewChild('stepper') private myStepper: MatStepper;
  @ViewChild('messageView') private messageView: MessageViewComponent;

  @Input()
  readonly: Boolean = true;

  @Input()
  costumerView: Boolean = false;

  @Input()
  voranmeldung: KurzArbeitVoranmeldung;

  kantonId: number;

  costumer: Costumer;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    if(this.router.getCurrentNavigation() != null) {
      console.log(this.router.getCurrentNavigation());
      if (this.router.getCurrentNavigation().extras.state.voranmeldung) {
        this.voranmeldung = this.router.getCurrentNavigation().extras.state.voranmeldung;
      }
      if (this.router.getCurrentNavigation().extras.state.readonly != undefined) {
        this.readonly = this.router.getCurrentNavigation().extras.state.readonly;
      }
      if (this.router.getCurrentNavigation().extras.state.kantonId != undefined) {
        this.kantonId = this.router.getCurrentNavigation().extras.state.kantonId;
      }
      if (this.router.getCurrentNavigation().extras.state.costumerView != undefined) {
        this.costumerView = this.router.getCurrentNavigation().extras.state.costumerView;
      }
    }
  }


  ngOnInit() {
    if(this.voranmeldung.costumerId){
      this.http.get<Costumer>(Api.COSTUMER + '/' + this.voranmeldung.costumerId).subscribe((res) => {
        console.log("Costumer")
        console.log(res)
        this.costumer = res;
      });
    }

    this.myStepper.selectedIndex = this.voranmeldung.status;
  }

  ngAfterContentChecked(){
    document.querySelectorAll<HTMLElement>('.mat-step-icon-state-edit').forEach(ele => {
      ele.parentElement.classList.add("doneStep");
    });
    document.querySelectorAll<HTMLElement>('.mat-step-icon-state-done').forEach(ele => {
      ele.parentElement.classList.add("doneStep");
    });
  }

  formFinished({voranmeldung, costumer}) {
    this.costumer = costumer;
    this.voranmeldung = voranmeldung;
    this.voranmeldung.status = 1;

    this.save();
    this.myStepper.selectedIndex = this.voranmeldung.status;
  }

  documentUploadFinished(voranmeldung: KurzArbeitVoranmeldung) {
    this.voranmeldung = voranmeldung;
    this.voranmeldung.status = 2;

    this.save();
    this.myStepper.selectedIndex = this.voranmeldung.status;
  }

  newMessage() {
    this.messageView.reload();
  }

  genehmigen() {
    this.voranmeldung.status=4;
    this.save();
    this.myStepper.selectedIndex = this.voranmeldung.status;
  }

  zurueckWeisen() {
    this.voranmeldung.status=3;
    this.save();
    this.myStepper.selectedIndex = this.voranmeldung.status;
  }

  save(){
    this.http.put<KurzArbeitVoranmeldung>(Api.KURZARBEIT_VORANMELDUNG+"/"+this.voranmeldung.id, this.voranmeldung).subscribe(anfrage => {
      this.voranmeldung = anfrage;
    });
  }

  getState() {
    if(this.voranmeldung.status==3){
      return 'abgelent';
    }
    return 'done';
  }
}